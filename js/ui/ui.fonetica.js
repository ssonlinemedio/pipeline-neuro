// ============================================================
// UI FONÉTICA v2.1 - SIN PETICIONES A GROQ
// ============================================================

class UIFonetica {
    constructor() {
        this._core = null;
        this._container = null;
        this._modo = 'lectura';
        this._elementos = [];
        this._elementoActual = 0;
        this._puntuacion = 0;
        this._total = 0;
        this._cargando = false;
        this._resultados = [];
        this._isAnswered = false;
        this._userAnswer = '';
        this._feedback = null;
        this._modosPractica = [
            { id: 'lectura', icono: '📖', nombre: 'Lectura', desc: 'Lee en voz alta la transcripción' },
            { id: 'escucha', icono: '👂', nombre: 'Escucha', desc: 'Escucha y repite la pronunciación' },
            { id: 'transcripcion_activa', icono: '✍️', nombre: 'Transcripción Activa', desc: 'Escribe la transcripción fonética' }
        ];
        // Mapeo de modos antiguos a nuevos para compatibilidad
        this._modoMap = {
            'comparacion': 'transcripcion_activa'
        };
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this._core = core || window.uiCore;
        
        window.addEventListener('idiomaCambiado', () => {
            if (this._container) {
                this.cargar(this._core);
            }
        });
        
        console.log('🎤 UIFonética v2.1: Inicializado (SIN GROQ)');
        return this;
    }

    cargar(core) {
        this._core = core || this._core;
        this._container = document.getElementById('foneticaContent');
        
        if (!this._container) {
            const moduleDiv = document.getElementById('foneticaModule');
            if (moduleDiv) {
                this._container = document.createElement('div');
                this._container.id = 'foneticaContent';
                moduleDiv.appendChild(this._container);
            }
        }
        
        if (this._container) {
            this._renderizarPanel();
        }
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL
    // ============================================================

    async _renderizarPanel() {
        if (this._cargando) return;
        this._cargando = true;
        
        const container = this._container;
        if (!container) {
            this._cargando = false;
            return;
        }

        const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivel = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const esJeroglifico = this._esJeroglifico(idiomaActivo);
        
        const estadisticas = await this._obtenerEstadisticas(idiomaActivo);
        
        // 🔥 OBTENER ELEMENTOS SOLO DE LA BASE DE DATOS (SIN GROQ)
        const elementos = await this._obtenerElementos(idiomaActivo);
        const totalElementos = elementos.length;

        // Normalizar el modo
        if (this._modoMap[this._modo]) {
            this._modo = this._modoMap[this._modo];
        }

        let html = `
            <div class="fonetica-container" style="padding:16px;">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--secondary)06, var(--primary)06);border-radius:14px;border:2px solid var(--secondary)20;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            🎤 Fonética
                            <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            Nivel <strong>${nivel}</strong> · 
                            ${totalElementos} elementos · 
                            ${esJeroglifico ? '🀄 Jeroglífico' : '🔤 Alfabético'}
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">
                                🎤 Transcripción: ${this._getNombreIdioma(this._idiomaNativo || 'es')}
                            </span>
                            <span style="font-size:10px;color:var(--success);margin-left:8px;">
                                ✅ Sin conexión a Groq
                            </span>
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIFonetica._alternarModo()" 
                                style="padding:6px 14px;font-size:12px;background:var(--secondary);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-sync"></i> Cambiar Modo
                        </button>
                        <button class="btn-secondary" onclick="window.UIFonetica._recargarEjercicios()" 
                                style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-refresh"></i> Recargar
                        </button>
                    </div>
                </div>

                <!-- ESTADÍSTICAS -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px;">
                    <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--secondary);">
                        <div style="font-size:20px;font-weight:800;color:var(--secondary);">${estadisticas.transcritas}</div>
                        <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Transcritas</div>
                    </div>
                    <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--primary);">
                        <div style="font-size:20px;font-weight:800;color:var(--primary);">${estadisticas.pendientes}</div>
                        <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Pendientes</div>
                    </div>
                    <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--success);">
                        <div style="font-size:20px;font-weight:800;color:var(--success);">${estadisticas.practicadas}</div>
                        <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Practicadas</div>
                    </div>
                    <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--warning);">
                        <div style="font-size:20px;font-weight:800;color:var(--warning);">${this._modosPractica.find(m => m.id === this._modo)?.nombre || 'Lectura'}</div>
                        <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Modo Actual</div>
                    </div>
                </div>

                <!-- EJERCICIO -->
                <div style="background:var(--white);border-radius:12px;padding:20px;box-shadow:var(--shadow);border:2px solid var(--secondary)20;">
                    ${this._renderizarEjercicio(elementos)}
                </div>

                <!-- INFORMACIÓN DE TRANSCRIPCIÓN -->
                <div style="margin-top:16px;background:var(--bg);border-radius:10px;padding:12px 16px;border:1px solid var(--light);">
                    <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
                        💡 ¿Cómo funciona la transcripción?
                    </div>
                    <div style="font-size:13px;color:var(--gray);line-height:1.6;">
                        La transcripción fonética te ayuda a pronunciar correctamente las palabras en <strong>${nombreIdioma}</strong>.
                        ${esJeroglifico ? 
                            'Para idiomas jeroglíficos, se utiliza el sistema Pinyin con tonos (ej: 你好 → nǐ hǎo).' : 
                            `Para idiomas alfabéticos, se genera una transcripción en <strong>${this._getNombreIdioma(this._idiomaNativo || 'es')}</strong> 
                            (ej: "I have a pencil" → "ai jaf a pensil").`}
                        <br>
                        <span style="font-size:11px;color:var(--gray-light);">
                            🔄 La transcripción se adapta automáticamente a tu idioma nativo.
                        </span>
                        <br>
                        <span style="font-size:10px;color:var(--success);">
                            ✅ Todas las transcripciones provienen del contenido importado (JSON), sin conexión a Groq.
                        </span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this._cargando = false;
    }

    // ============================================================
    // RENDERIZAR EJERCICIO
    // ============================================================

    _renderizarEjercicio(elementos) {
        if (!elementos || elementos.length === 0) {
            return `
                <div style="text-align:center;padding:40px;color:var(--gray);">
                    <i class="fas fa-book" style="font-size:48px;color:var(--gray-light);display:block;margin-bottom:16px;"></i>
                    <p style="font-size:16px;font-weight:500;">No hay elementos para practicar</p>
                    <p style="font-size:13px;color:var(--gray-light);">
                        Importa contenido con transcripciones fonéticas desde el Generador JSON.
                        <br>
                        <button class="btn-primary" onclick="window.uiCore.irAModulo('json')" 
                                style="margin-top:8px;padding:8px 20px;font-size:13px;">
                            <i class="fas fa-file-import"></i> Ir a Generador JSON
                        </button>
                    </p>
                </div>
            `;
        }

        const elemento = elementos[this._elementoActual] || elementos[0];
        const total = elementos.length;
        const progreso = ((this._elementoActual + 1) / total * 100).toFixed(0);

        // Normalizar el modo
        if (this._modoMap[this._modo]) {
            this._modo = this._modoMap[this._modo];
        }

        let html = `
            <div style="text-align:center;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                    <span style="font-size:13px;color:var(--gray);">
                        <i class="fas fa-list"></i> ${this._elementoActual + 1} de ${total}
                    </span>
                    <span style="font-size:13px;color:var(--gray);">
                        🎯 Progreso: ${progreso}%
                    </span>
                </div>

                <div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden;margin-bottom:16px;">
                    <div style="height:100%;width:${progreso}%;background:linear-gradient(90deg,var(--secondary),var(--primary));border-radius:2px;transition:width 0.5s ease;"></div>
                </div>

                <!-- TEXTO ORIGINAL -->
                <div style="font-size:28px;font-weight:700;color:var(--dark);margin-bottom:8px;">
                    ${elemento.original}
                </div>

                <!-- TRANSCRIPCIÓN FONÉTICA -->
                ${elemento.transcripcion ? `
                    <div class="transcripcion-destacada" style="
                        font-size:22px;
                        color:var(--secondary);
                        font-weight:500;
                        padding:12px 20px;
                        background:var(--secondary)08;
                        border-radius:12px;
                        display:inline-block;
                        border:2px solid var(--secondary)30;
                        margin-bottom:12px;
                    ">
                        🔊 ${elemento.transcripcion}
                    </div>
                ` : `
                    <div style="font-size:14px;color:var(--gray-light);margin-bottom:12px;">
                        ⚠️ Sin transcripción disponible
                    </div>
                `}

                <!-- TRADUCCIÓN -->
                ${elemento.traduccion ? `
                    <div style="font-size:16px;color:var(--gray);margin-bottom:8px;">
                        → ${elemento.traduccion}
                    </div>
                ` : ''}

                <!-- EJERCICIO SEGÚN MODO -->
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--light);">
                    ${this._renderizarEjercicioModo(elemento)}
                </div>

                <!-- CONTROLES DE NAVEGACIÓN -->
                <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.UIFonetica._elementoAnterior()" 
                            style="padding:8px 20px;font-size:13px;${this._elementoActual <= 0 ? 'opacity:0.5;cursor:default;' : ''}" 
                            ${this._elementoActual <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <button class="btn-primary" onclick="window.UIFonetica._elementoSiguiente()" 
                            style="padding:8px 20px;font-size:13px;${this._elementoActual >= total - 1 ? 'opacity:0.5;cursor:default;' : ''}" 
                            ${this._elementoActual >= total - 1 ? 'disabled' : ''}>
                        Siguiente <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // RENDERIZAR EJERCICIO SEGÚN MODO
    // ============================================================

    _renderizarEjercicioModo(elemento) {
        const modo = this._modo;
        const transcripcion = elemento.transcripcion || '';
        const texto = elemento.original || '';

        switch(modo) {
            case 'lectura':
                return `
                    <div style="font-size:14px;color:var(--gray);margin-bottom:8px;">
                        📖 Lee en voz alta la transcripción fonética:
                    </div>
                    <div style="background:var(--bg);border-radius:8px;padding:16px;border:1px dashed var(--light);">
                        <div style="font-size:18px;color:var(--dark);font-weight:600;">${transcripcion || 'No disponible'}</div>
                        <div style="font-size:12px;color:var(--gray-light);margin-top:4px;">
                            💡 Pronuncia cada sílaba claramente
                        </div>
                    </div>
                    <button class="btn-success" onclick="window.UIFonetica._marcarPracticada()" 
                            style="margin-top:10px;padding:8px 20px;font-size:13px;background:var(--success);color:white;border:none;border-radius:6px;cursor:pointer;">
                        ✅ He practicado esta palabra
                    </button>
                `;

            case 'escucha':
                return `
                    <div style="font-size:14px;color:var(--gray);margin-bottom:8px;">
                        👂 Escucha mentalmente la pronunciación y repite:
                    </div>
                    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                        <div style="background:var(--bg);border-radius:8px;padding:16px;border:1px dashed var(--light);flex:1;min-width:150px;">
                            <div style="font-size:18px;color:var(--dark);font-weight:600;">${texto}</div>
                            <div style="font-size:13px;color:var(--gray-light);margin-top:4px;">
                                🔊 ${transcripcion || 'No disponible'}
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px;justify-content:center;">
                            <button class="btn-secondary" onclick="window.UIFonetica._mostrarPista('${texto.replace(/'/g, "\\'")}', '${transcripcion.replace(/'/g, "\\'")}')" 
                                    style="padding:6px 16px;font-size:12px;background:var(--secondary);color:white;border:none;border-radius:6px;cursor:pointer;">
                                💡 Pista
                            </button>
                            <button class="btn-success" onclick="window.UIFonetica._marcarPracticada()" 
                                    style="padding:6px 16px;font-size:12px;background:var(--success);color:white;border:none;border-radius:6px;cursor:pointer;">
                                ✅ Hecho
                            </button>
                        </div>
                    </div>
                `;

            case 'transcripcion_activa':
                const isAnswered = this._isAnswered || false;
                const userAnswer = this._userAnswer || '';
                const feedback = this._feedback || null;
                const isCorrect = feedback?.correcto || false;
                const isPartial = feedback?.parcial || false;

                let inputClass = '';
                let feedbackHtml = '';
                let feedbackClass = '';

                if (isAnswered) {
                    if (isCorrect) {
                        inputClass = 'correct';
                        feedbackClass = 'success';
                        feedbackHtml = `
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:24px;">✅</span>
                                <div>
                                    <div style="font-weight:600;color:var(--success);">¡Perfecto! Tu transcripción es correcta.</div>
                                    <div style="font-size:12px;color:var(--gray-light);margin-top:2px;">${feedback?.mensaje || ''}</div>
                                </div>
                            </div>
                        `;
                    } else if (isPartial) {
                        inputClass = 'partial';
                        feedbackClass = 'partial';
                        feedbackHtml = `
                            <div style="display:flex;align-items:start;gap:8px;">
                                <span style="font-size:24px;">🟡</span>
                                <div>
                                    <div style="font-weight:600;color:var(--warning);">Casi correcto. Revisa las diferencias:</div>
                                    <div style="font-size:13px;color:var(--dark);margin-top:4px;">
                                        <strong>Tu respuesta:</strong> ${userAnswer}
                                    </div>
                                    <div style="font-size:13px;color:var(--dark);">
                                        <strong>Esperado:</strong> ${transcripcion}
                                    </div>
                                    ${feedback?.diferencias ? `
                                        <div style="font-size:12px;color:var(--gray-light);margin-top:4px;">
                                            💡 ${feedback.diferencias}
                                        </div>
                                    ` : ''}
                                    ${feedback?.mensaje ? `
                                        <div style="font-size:12px;color:var(--gray);margin-top:2px;">${feedback.mensaje}</div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    } else {
                        inputClass = 'incorrect';
                        feedbackClass = 'error';
                        feedbackHtml = `
                            <div style="display:flex;align-items:start;gap:8px;">
                                <span style="font-size:24px;">❌</span>
                                <div>
                                    <div style="font-weight:600;color:var(--danger);">Incorrecto. La transcripción correcta es:</div>
                                    <div style="font-size:18px;font-weight:600;color:var(--secondary);margin:4px 0;">${transcripcion}</div>
                                    <div style="font-size:13px;color:var(--gray);">
                                        <strong>Tu respuesta:</strong> ${userAnswer}
                                    </div>
                                    ${feedback?.mensaje ? `
                                        <div style="font-size:12px;color:var(--gray-light);margin-top:2px;">💡 ${feedback.mensaje}</div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }
                }

                return `
                    <div style="text-align:left;">
                        <div style="font-size:14px;font-weight:600;color:var(--gray);margin-bottom:4px;">
                            ✍️ Escribe la transcripción fonética en <strong>${this._getNombreIdioma(this._idiomaNativo || 'es')}</strong>
                        </div>
                        <div style="font-size:13px;color:var(--gray-light);margin-bottom:12px;">
                            💡 Usa la transcripción que aparece en la tarjeta como guía
                        </div>
                        
                        <div style="display:flex;gap:10px;flex-wrap:wrap;">
                            <div style="flex:1;min-width:200px;">
                                <input type="text" id="transcripcionInput" 
                                       placeholder="Escribe la transcripción fonética..." 
                                       value="${isAnswered ? userAnswer : ''}"
                                       style="width:100%;padding:12px 16px;border:2px solid ${isAnswered ? (isCorrect ? 'var(--success)' : isPartial ? 'var(--warning)' : 'var(--danger)') : 'var(--light)'};border-radius:10px;font-size:16px;font-family:var(--font);transition:all 0.3s;${isAnswered ? 'opacity:0.7;' : ''}"
                                       ${isAnswered ? 'disabled' : ''}
                                       onfocus="this.style.borderColor='var(--primary)'" 
                                       onblur="this.style.borderColor='var(--light)'">
                            </div>
                            ${!isAnswered ? `
                                <button class="btn-primary" onclick="window.UIFonetica._validarTranscripcionActiva()" 
                                        style="padding:12px 24px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:10px;cursor:pointer;white-space:nowrap;transition:all 0.3s;"
                                        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                                        onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                    <i class="fas fa-check"></i> Validar
                                </button>
                            ` : `
                                <button class="btn-secondary" onclick="window.UIFonetica._resetearTranscripcionActiva()" 
                                        style="padding:12px 24px;font-size:15px;font-weight:600;background:var(--secondary);color:white;border:none;border-radius:10px;cursor:pointer;white-space:nowrap;transition:all 0.3s;">
                                    <i class="fas fa-redo"></i> Reintentar
                                </button>
                            `}
                        </div>

                        ${isAnswered ? `
                            <div style="margin-top:12px;padding:12px 16px;border-radius:8px;background:${isCorrect ? 'var(--success)08' : isPartial ? 'var(--warning)08' : 'var(--danger)08'};border:1px solid ${isCorrect ? 'var(--success)' : isPartial ? 'var(--warning)' : 'var(--danger)'};">
                                ${feedbackHtml}
                            </div>
                            ${isCorrect ? `
                                <div style="margin-top:8px;font-size:12px;color:var(--gray-light);">
                                    ✅ Avanzando automáticamente en 2 segundos...
                                </div>
                            ` : ''}
                        ` : ''}
                    </div>
                `;

            default:
                return '';
        }
    }

    // ============================================================
    // NUEVO MÉTODO: VALIDAR TRANSCRIPCIÓN ACTIVA
    // ============================================================

    _validarTranscripcionActiva() {
        if (this._isAnswered) return;

        const input = document.getElementById('transcripcionInput');
        if (!input) return;

        const userAnswer = input.value.trim();
        if (!userAnswer) {
            this._core?.mostrarToast('✍️ Por favor, escribe una transcripción antes de validar.', 'warning');
            return;
        }

        const elemento = this._elementos[this._elementoActual];
        if (!elemento || !elemento.transcripcion) {
            this._core?.mostrarToast('⚠️ No hay transcripción para validar.', 'error');
            return;
        }

        const expected = elemento.transcripcion;
        const isExactMatch = userAnswer.toLowerCase() === expected.toLowerCase();

        // Cálculo de similitud para feedback parcial
        const similitud = this._calcularSimilitudLevenshtein(
            userAnswer.toLowerCase(), 
            expected.toLowerCase()
        );

        const isPartial = similitud >= 0.6 && !isExactMatch;

        let feedback = {
            correcto: isExactMatch,
            parcial: isPartial,
            mensaje: '',
            diferencias: ''
        };

        if (isExactMatch) {
            feedback.mensaje = '¡Excelente! Has escrito la transcripción correctamente.';
            this._puntuacion += 10;
        } else if (isPartial) {
            feedback.mensaje = `Has acertado aproximadamente el ${Math.round(similitud * 100)}% de la transcripción.`;
            // Mostrar diferencias simples
            const userWords = userAnswer.split(' ');
            const expectedWords = expected.split(' ');
            let diffParts = [];
            for (let i = 0; i < Math.max(userWords.length, expectedWords.length); i++) {
                const u = userWords[i] || '[omitido]';
                const e = expectedWords[i] || '[extra]';
                if (u.toLowerCase() !== e.toLowerCase()) {
                    diffParts.push(`"${u}" → "${e}"`);
                }
            }
            if (diffParts.length > 0) {
                feedback.diferencias = `Diferencias: ${diffParts.join(' · ')}`;
            }
            this._puntuacion += 5;
        } else {
            feedback.mensaje = 'Revisa la transcripción y vuelve a intentarlo.';
            this._puntuacion += 0;
        }

        this._userAnswer = userAnswer;
        this._feedback = feedback;
        this._isAnswered = true;

        // Guardar resultado
        this._resultados.push({
            ...elemento,
            userAnswer: userAnswer,
            correcto: isExactMatch,
            parcial: isPartial,
            fecha: Date.now()
        });

        // Re-renderizar
        this._renderizarPanel();

        // Avance automático si es correcto
        if (isExactMatch) {
            this._core?.mostrarToast('✅ ¡Correcto!', 'success');
            setTimeout(() => {
                this._elementoSiguiente();
            }, 2000);
        } else if (isPartial) {
            this._core?.mostrarToast('🟡 Casi correcto. Revisa las diferencias.', 'warning');
        } else {
            this._core?.mostrarToast('❌ Incorrecto. Intenta de nuevo.', 'error');
        }
    }

    // ============================================================
    // RESETEAR TRANSCRIPCIÓN ACTIVA
    // ============================================================

    _resetearTranscripcionActiva() {
        this._isAnswered = false;
        this._userAnswer = '';
        this._feedback = null;
        this._renderizarPanel();
        setTimeout(() => {
            const input = document.getElementById('transcripcionInput');
            if (input) input.focus();
        }, 100);
    }

    // ============================================================
    // CALCULAR SIMILITUD LEVENSHTEIN
    // ============================================================

    _calcularSimilitudLevenshtein(a, b) {
        if (a.length === 0) return b.length === 0 ? 1 : 0;
        if (b.length === 0) return 0;
        
        const matrix = [];
        for (let i = 0; i <= a.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= b.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i-1] === b[j-1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j-1] + cost
                );
            }
        }
        const distancia = matrix[a.length][b.length];
        const maxLen = Math.max(a.length, b.length);
        return 1 - (distancia / maxLen);
    }

    // ============================================================
    // MÉTODOS DE NAVEGACIÓN
    // ============================================================

    _elementoAnterior() {
        if (this._elementoActual > 0) {
            this._elementoActual--;
            this._resetearEstadoEjercicio();
            this._renderizarPanel();
        }
    }

    _elementoSiguiente() {
        if (this._elementoActual < this._elementos.length - 1) {
            this._elementoActual++;
            this._resetearEstadoEjercicio();
            this._renderizarPanel();
        } else {
            this._core?.mostrarToast('🎉 ¡Has completado todos los ejercicios de este modo!', 'success');
        }
    }

    _resetearEstadoEjercicio() {
        this._isAnswered = false;
        this._userAnswer = '';
        this._feedback = null;
    }

    _marcarPracticada() {
        const elemento = this._elementos[this._elementoActual];
        if (elemento) {
            this._resultados.push({
                ...elemento,
                fecha: Date.now(),
                modo: this._modo
            });
            this._core?.mostrarToast(`✅ Practicada: "${elemento.original}"`, 'success');
            
            setTimeout(() => {
                this._elementoSiguiente();
            }, 500);
        }
    }

    _mostrarPista(texto, transcripcion) {
        this._core?.alert(
            `💡 Pista de pronunciación\n\n` +
            `📖 Texto: "${texto}"\n` +
            `🎤 Transcripción: "${transcripcion || 'No disponible'}"\n\n` +
            `🔊 Intenta pronunciar cada sonido por separado:\n` +
            `${transcripcion ? transcripcion.split(' ').map(s => `• ${s}`).join('\n') : 'Genera la transcripción primero.'}`,
            '💡 Pista Fonética'
        );
    }

    _alternarModo() {
        const modos = ['lectura', 'escucha', 'transcripcion_activa'];
        const idx = modos.indexOf(this._modo);
        this._modo = modos[(idx + 1) % modos.length];
        this._resetearEstadoEjercicio();
        this._core?.mostrarToast(`🔄 Modo: ${this._modosPractica.find(m => m.id === this._modo)?.nombre}`, 'info');
        this._renderizarPanel();
    }

    async _recargarEjercicios() {
        this._core?.mostrarToast('🔄 Recargando ejercicios...', 'info');
        this._elementoActual = 0;
        this._resultados = [];
        this._resetearEstadoEjercicio();
        await this._renderizarPanel();
        this._core?.mostrarToast('✅ Ejercicios recargados', 'success');
    }

    // ============================================================
    // OBTENER ELEMENTOS PARA PRÁCTICA (SIN GROQ)
    // ============================================================

    async _obtenerElementos(idioma) {
        const elementos = [];
        const idiomaActivo = idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const esJeroglifico = this._esJeroglifico(idiomaActivo);

        // Obtener idioma nativo para mostrar al usuario
        try {
            const usuario = await db.getUsuario();
            this._idiomaNativo = usuario?.idiomaNativo || 'es';
        } catch (e) {
            this._idiomaNativo = 'es';
        }

        try {
            // 🔥 SOLO OBTENER FRASES Y PALABRAS DE LA DB
            const frases = await db.obtenerFrasesPorIdioma(idiomaActivo);
            
            // Filtrar SOLO elementos que YA tienen transcripción
            const frasesConTranscripcion = frases.filter(f => {
                if (esJeroglifico) {
                    return f.pinyinCompleto || f.segmentacion?.pinyin;
                } else {
                    return f.transcripcion && f.transcripcion.length > 0;
                }
            });

            for (const frase of frasesConTranscripcion) {
                let transcripcion = '';
                if (esJeroglifico) {
                    transcripcion = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
                } else {
                    transcripcion = frase.transcripcion || '';
                }
                
                if (transcripcion) {
                    elementos.push({
                        id: frase.id,
                        tipo: 'frase',
                        original: frase.original,
                        traduccion: frase.traduccion,
                        transcripcion: transcripcion,
                        nivel: frase.nivel || 'A1'
                    });
                }
            }

            // Obtener palabras con transcripción
            const palabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
            const palabrasConTranscripcion = palabras.filter(p => {
                if (esJeroglifico) {
                    return p.pinyin && p.pinyin.length > 0;
                } else {
                    return p.transcripcion && p.transcripcion.length > 0;
                }
            });

            for (const palabra of palabrasConTranscripcion) {
                const texto = palabra.palabra || palabra.hanzi || '';
                if (!texto) continue;
                
                let transcripcion = '';
                if (esJeroglifico) {
                    transcripcion = palabra.pinyin || '';
                } else {
                    transcripcion = palabra.transcripcion || '';
                }
                
                if (transcripcion) {
                    elementos.push({
                        id: palabra.id,
                        tipo: 'palabra',
                        original: texto,
                        traduccion: palabra.significado || '',
                        transcripcion: transcripcion,
                        nivel: palabra.nivel || 'A1'
                    });
                }
            }

            // 🔥 SIN MEZCLAR - MANTENER ORDEN ORIGINAL
            // Solo limitar a 50 elementos
            const limitados = elementos.slice(0, 50);
            
            console.log(`📚 ${limitados.length} elementos cargados para práctica fonética (SOLO CON TRANSCRIPCIÓN)`);
            console.log(`   📝 Frases con transcripción: ${frasesConTranscripcion.length}`);
            console.log(`   📖 Palabras con transcripción: ${palabrasConTranscripcion.length}`);
            console.log(`   ✅ SIN PETICIONES A GROQ`);
            
            this._elementos = limitados;
            this._elementoActual = 0;
            return limitados;

        } catch (error) {
            console.error('❌ Error obteniendo elementos:', error);
            return [];
        }
    }

    // ============================================================
    // OBTENER ESTADÍSTICAS
    // ============================================================

    async _obtenerEstadisticas(idioma) {
        const idiomaActivo = idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const esJeroglifico = this._esJeroglifico(idiomaActivo);
        
        try {
            const frases = await db.obtenerFrasesPorIdioma(idiomaActivo);
            const palabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
            
            let transcritas = 0;
            let pendientes = 0;
            
            // Contar frases con transcripción
            for (const f of frases) {
                if (esJeroglifico) {
                    if (f.pinyinCompleto || f.segmentacion?.pinyin) transcritas++;
                    else pendientes++;
                } else {
                    if (f.transcripcion && f.transcripcion.length > 0) transcritas++;
                    else pendientes++;
                }
            }
            
            // Contar palabras con transcripción
            for (const p of palabras) {
                const texto = p.palabra || p.hanzi || '';
                if (!texto) continue;
                
                if (esJeroglifico) {
                    if (p.pinyin && p.pinyin.length > 0) transcritas++;
                    else pendientes++;
                } else {
                    if (p.transcripcion && p.transcripcion.length > 0) transcritas++;
                    else pendientes++;
                }
            }
            
            return {
                transcritas: transcritas,
                pendientes: pendientes,
                practicadas: this._resultados.length
            };
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas:', error);
            return { transcritas: 0, pendientes: 0, practicadas: 0 };
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        const idiomaLower = idioma.toLowerCase().trim();
        return jeroglificos.some(item => 
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
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIFonetica = new UIFonetica();

console.log('✅ UIFonética v2.1 - SIN PETICIONES A GROQ');
console.log('  🚫 ELIMINADAS todas las llamadas a Groq');
console.log('  📝 Solo usa transcripciones del JSON importado');
console.log('  ✍️ Modo "Transcripción Activa" para practicar escritura');
console.log('  🔄 Feedback detallado con diferencias resaltadas');
console.log('  📊 Puntuación automática');
console.log('  🚀 Avance automático al acertar');
console.log('  ⚡ SIN RATE LIMIT - SIN PETICIONES EXTERNAS');