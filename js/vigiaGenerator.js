// ============================================================
// VIGÍA GENERATOR v6.1 - DEFINITIVO (SIN TRADUCCIÓN)
// ============================================================

class VigiaGenerator {
    constructor() {
        this._fiabilidad = 0;
        this._idiomaActual = null;
        this._generando = false;
        this._frasesGeneradas = [];
        this._initDone = false;
        this._reglasGramaticalesCache = [];
        
        // TEMAS Y VOCABULARIO
        this._TEMAS = {
            'casa': ['casa', 'habitación', 'cocina', 'baño', 'salón', 'ventana', 'puerta', 'mesa', 'silla', 'cama'],
            'comida': ['pan', 'arroz', 'fideos', 'huevo', 'carne', 'pescado', 'fruta', 'verduras', 'leche', 'jugo', 'café', 'té', 'agua'],
            'familia': ['padre', 'madre', 'hermano', 'hermana', 'abuelo', 'abuela', 'hijo', 'hija', 'familia'],
            'ciudad': ['ciudad', 'calle', 'parque', 'tienda', 'restaurante', 'escuela', 'hospital', 'banco', 'plaza', 'museo'],
            'tiempo': ['día', 'noche', 'mañana', 'tarde', 'hora', 'semana', 'mes', 'año', 'momento', 'sol', 'lluvia']
        };
        
        this._PALABRAS_CHINO = {
            sujetos: ['我', '你', '他', '她', '我们', '你们', '他们', '服务员', '老师', '朋友', '妈妈', '爸爸'],
            verbos: ['吃', '喝', '去', '看', '做', '说', '走', '有', '是', '喜欢', '买', '要', '想', '爱', '进', '坐', '站'],
            objetos: ['饭', '水', '书', '家', '咖啡', '茶', '面包', '牛奶', '苹果', '鸡蛋', '面条', '米饭', '城市', '公园', '学校'],
            lugares: ['家', '学校', '餐厅', '咖啡馆', '商店', '公园', '城市', '街上', '厨房', '厕所'],
            adjetivos: ['大', '小', '漂亮', '美丽', '干净', '好吃', '好喝', '舒服', '现代', '古老', '热闹', '安静'],
            demostrativos: ['这', '那'],
            clasificadores: ['个', '杯', '碗', '盘', '张', '把', '本', '支', '块', '片']
        };
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(vigiaGramatical) {
        if (this._initDone) return this;
        
        if (vigiaGramatical) {
            this._vigiaGramatical = vigiaGramatical;
        } else if (window.vigiaGramatical) {
            this._vigiaGramatical = window.vigiaGramatical;
        }
        
        try {
            const idioma = this._idiomaActual || gestorIdiomas?.getIdiomaActivo() || 'zh';
            const reglas = await db.obtenerReglasGramaticales(idioma);
            this._reglasGramaticalesCache = reglas || [];
        } catch (e) {
            console.warn('⚠️ Error cargando reglas gramaticales:', e);
        }
        
        this._initDone = true;
        console.log('✅ VigíaGenerator v6.1 inicializado');
        return this;
    }

    // ============================================================
    // CALCULAR FIABILIDAD
    // ============================================================

    async calcularFiabilidad(idioma) {
        this._idiomaActual = idioma;
        
        try {
            const frases = await db.obtenerFrasesPorIdioma(idioma) || [];
            const palabras = await db.obtenerPalabrasPorIdioma(idioma) || [];
            const historias = await db.obtenerHistoriasPorIdioma(idioma) || [];
            const reglas = this._reglasGramaticalesCache || [];

            let puntaje = 0;
            if (frases.length > 0) puntaje += Math.min(40, (frases.length / 50) * 40);
            if (palabras.length > 0) puntaje += Math.min(25, (palabras.length / 100) * 25);
            if (historias.length > 0) puntaje += Math.min(20, (historias.length / 10) * 20);
            if (reglas.length > 0) puntaje += Math.min(15, (reglas.length / 15) * 15);

            this._fiabilidad = Math.round(Math.min(100, puntaje));
            
            return {
                fiabilidad: this._fiabilidad,
                detalles: {
                    totalFrases: frases.length,
                    totalPalabras: palabras.length,
                    totalHistorias: historias.length,
                    totalReglas: reglas.length
                },
                nivelConfianza: this._getNivelConfianza(this._fiabilidad)
            };
        } catch (error) {
            return {
                fiabilidad: 0,
                detalles: { error: error.message },
                nivelConfianza: '🔴 Sin datos'
            };
        }
    }

    _getNivelConfianza(fiabilidad) {
        if (fiabilidad >= 80) return '🟣 Excelente';
        if (fiabilidad >= 60) return '🟢 Bueno';
        if (fiabilidad >= 40) return '🟡 Aceptable';
        if (fiabilidad >= 20) return '🟠 Bajo';
        return '🔴 Insuficiente';
    }

    // ============================================================
    // GENERAR PINYIN
    // ============================================================

    async _generarPinyinChino(texto) {
        try {
            const palabras = await db.obtenerPalabrasPorIdioma('zh') || [];
            const pinyinParts = [];
            const chars = texto.split('');
            
            for (const c of chars) {
                if (c === ' ' || c === '，' || c === '。' || c === '？' || c === '！') {
                    pinyinParts.push(c);
                    continue;
                }
                const encontrada = palabras.find(p => p.palabra === c || p.hanzi === c);
                pinyinParts.push(encontrada?.pinyin || c);
            }
            return pinyinParts.join(' ');
        } catch (e) {
            return '';
        }
    }

    // ============================================================
    // GENERAR FRASES - SOLO IDIOMA OBJETIVO (SIN TRADUCCIÓN)
    // ============================================================

    async generarFrases(idioma, cantidad = 3, nivel = 'A1', tema = null) {
        if (this._generando) {
            return {
                exito: false,
                mensaje: '⏳ Ya hay una generación en curso',
                frases: [],
                fiabilidad: null
            };
        }

        this._generando = true;
        this._frasesGeneradas = [];

        try {
            const fiabilidad = await this.calcularFiabilidad(idioma);
            
            if (fiabilidad.fiabilidad < 30) {
                this._generando = false;
                return {
                    exito: false,
                    mensaje: `📚 Necesitas más datos (${fiabilidad.fiabilidad}%).`,
                    frases: [],
                    fiabilidad: fiabilidad
                };
            }

            // Obtener frases reales de las historias
            const historias = await db.obtenerHistoriasPorIdioma(idioma) || [];
            let todasLasFrases = [];
            
            for (const h of historias) {
                const frases = await db.obtenerFrasesPorHistoria(h.id) || [];
                todasLasFrases = todasLasFrases.concat(frases);
            }

            if (todasLasFrases.length === 0) {
                this._generando = false;
                return {
                    exito: false,
                    mensaje: '📚 No hay frases para generar.',
                    frases: [],
                    fiabilidad: fiabilidad
                };
            }

            // Seleccionar frases aleatorias
            const frasesSeleccionadas = [];
            const copiaFrases = [...todasLasFrases];
            
            for (let i = 0; i < Math.min(cantidad, copiaFrases.length); i++) {
                const idx = Math.floor(Math.random() * copiaFrases.length);
                frasesSeleccionadas.push(copiaFrases.splice(idx, 1)[0]);
            }

            const frasesGeneradas = [];
            const palabrasChino = this._PALABRAS_CHINO;

            for (const fraseOriginal of frasesSeleccionadas) {
                if (!fraseOriginal.original) continue;
                
                let nuevaFrase = fraseOriginal.original;
                let reglaGramatical = fraseOriginal.reglaGramatical || null;
                let explicacionGramatical = fraseOriginal.explicacionGramatical || null;
                let fraseModificada = false;

                // Intentar reemplazar palabras
                if (fraseOriginal.palabras && fraseOriginal.palabras.length > 0) {
                    for (const p of fraseOriginal.palabras) {
                        const texto = p.palabra || p.hanzi || '';
                        if (!texto || texto.length < 2) continue;
                        
                        // Detectar tipo de palabra
                        let tipo = 'objetos';
                        if (palabrasChino.sujetos.includes(texto)) tipo = 'sujetos';
                        else if (palabrasChino.verbos.includes(texto)) tipo = 'verbos';
                        else if (palabrasChino.objetos.includes(texto)) tipo = 'objetos';
                        else if (palabrasChino.lugares.includes(texto)) tipo = 'lugares';
                        else if (palabrasChino.adjetivos.includes(texto)) tipo = 'adjetivos';
                        else if (palabrasChino.demostrativos.includes(texto)) tipo = 'demostrativos';
                        else if (palabrasChino.clasificadores.includes(texto)) tipo = 'clasificadores';
                        
                        // Buscar reemplazo del mismo tipo
                        const lista = palabrasChino[tipo] || [];
                        const candidatas = lista.filter(w => w !== texto);
                        
                        if (candidatas.length > 0) {
                            const reemplazo = candidatas[Math.floor(Math.random() * candidatas.length)];
                            if (reemplazo && reemplazo !== texto) {
                                nuevaFrase = nuevaFrase.replace(texto, reemplazo);
                                fraseModificada = true;
                            }
                        }
                    }
                }

                // Si no se modificó, usar una frase aleatoria
                if (!fraseModificada) {
                    const aleatorias = [...todasLasFrases].sort(() => Math.random() - 0.5);
                    if (aleatorias.length > 0) {
                        const aleatoria = aleatorias[0];
                        nuevaFrase = aleatoria.original;
                        reglaGramatical = aleatoria.reglaGramatical || reglaGramatical;
                        explicacionGramatical = aleatoria.explicacionGramatical || explicacionGramatical;
                    }
                }

                nuevaFrase = nuevaFrase.replace(/\s+/g, ' ').trim();

                // Buscar regla gramatical
                if (!reglaGramatical && this._reglasGramaticalesCache.length > 0) {
                    const regla = this._reglasGramaticalesCache[
                        Math.floor(Math.random() * this._reglasGramaticalesCache.length)
                    ];
                    if (regla) {
                        reglaGramatical = regla.regla || regla.nombre || 'Estructura básica';
                        explicacionGramatical = regla.explicacion || `Regla: ${reglaGramatical}`;
                    }
                }

                if (!reglaGramatical) {
                    reglaGramatical = 'Estructura básica del idioma';
                    explicacionGramatical = 'Frase generada a partir de una plantilla existente.';
                }

                // Generar pinyin
                const pinyinCompleto = await this._generarPinyinChino(nuevaFrase);

                // 🔥 IMPORTANTE: NO incluimos traducción
                frasesGeneradas.push({
                    original: nuevaFrase,
                    pinyinCompleto: pinyinCompleto || '',
                    reglaGramatical: reglaGramatical,
                    explicacionGramatical: explicacionGramatical,
                    esGenerada: true,
                    idioma: idioma,
                    nivel: nivel || 'A1',
                    fiabilidad: this._fiabilidad
                });
            }

            this._frasesGeneradas = frasesGeneradas;
            this._generando = false;

            return {
                exito: true,
                mensaje: `✅ ${frasesGeneradas.length} frases generadas (${fiabilidad.fiabilidad}% de fiabilidad)`,
                frases: frasesGeneradas,
                fiabilidad: fiabilidad
            };

        } catch (error) {
            this._generando = false;
            console.error('❌ Error generando frases:', error);
            return {
                exito: false,
                mensaje: '❌ Error al generar frases: ' + error.message,
                frases: [],
                fiabilidad: null
            };
        }
    }

    // ============================================================
    // GUARDAR FRASES GENERADAS
    // ============================================================

    async guardarFrasesGeneradas(frases, temaId = null) {
        let temaGuardado = null;
        
        try {
            if (temaId) {
                temaGuardado = await db.obtenerTema(temaId);
            }
            
            if (!temaGuardado && frases.length > 0) {
                const idioma = frases[0]?.idioma || 'zh';
                const nivel = frases[0]?.nivel || 'A1';
                
                const nuevoTema = {
                    nombre: `🧠 Frases Generadas - ${new Date().toLocaleDateString()}`,
                    descripcion: `Frases generadas automáticamente con ${this._fiabilidad}% de fiabilidad`,
                    idioma: idioma,
                    nivel: nivel,
                    icono: '🧠',
                    fechaCreacion: new Date().toISOString(),
                    estado: 'en_curso',
                    historiasIds: [],
                    palabrasClave: [],
                    _esGenerado: true,
                    _fiabilidad: this._fiabilidad || 0
                };
                
                temaGuardado = await db.guardarTema(nuevoTema);
            }

            let frasesGuardadas = 0;
            
            for (const fraseData of frases) {
                if (!fraseData.original) continue;
                
                const frasesExistentes = await db.obtenerFrasesPorIdioma(fraseData.idioma) || [];
                const existe = frasesExistentes.some(f => f.original === fraseData.original);
                if (existe) continue;

                // 🔥 SIN TRADUCCIÓN - se añadirá después con Groq
                const fraseObj = {
                    original: fraseData.original,
                    traduccion: '', // Vacío - se llena con Groq
                    idioma: fraseData.idioma,
                    nivel: fraseData.nivel || 'A1',
                    esJeroglifico: fraseData.pinyinCompleto ? true : false,
                    pinyinCompleto: fraseData.pinyinCompleto || '',
                    palabras: [],
                    reglaGramatical: fraseData.reglaGramatical || null,
                    explicacionGramatical: fraseData.explicacionGramatical || null,
                    _esGenerada: true,
                    _fiabilidad: fraseData.fiabilidad || 0,
                    activa: true,
                    rg: 0,
                    rcn: 0,
                    historiaId: temaGuardado?.id || null,
                    neuroData: {
                        exposiciones: 0,
                        aciertosConsecutivos: 0,
                        fallosConsecutivos: 0,
                        nivelConfianza: 0.5,
                        ultimaActivacion: Date.now(),
                        consolidacion: 0
                    }
                };
                
                const id = await db.guardarFrase(fraseObj);
                if (id) frasesGuardadas++;
            }

            if (temaGuardado && frasesGuardadas > 0) {
                const historias = await db.obtenerHistoriasPorTema(temaGuardado.id) || [];
                const historiasIds = historias.map(h => h.id);
                await db.actualizarTema(temaGuardado.id, {
                    historiasIds: historiasIds,
                    frases: (temaGuardado.frases || 0) + frasesGuardadas,
                    estado: 'en_curso'
                });
            }

            return {
                totalGuardadas: frasesGuardadas,
                temaId: temaGuardado?.id || null,
                mensaje: `✅ ${frasesGuardadas} frases guardadas`
            };

        } catch (error) {
            console.error('❌ Error guardando frases:', error);
            return {
                totalGuardadas: 0,
                temaId: null,
                mensaje: '❌ Error al guardar: ' + error.message
            };
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    getEstado() {
        return {
            generando: this._generando,
            fiabilidad: this._fiabilidad,
            frasesGeneradas: this._frasesGeneradas.length,
            initDone: this._initDone
        };
    }

    getFrasesGeneradas() {
        return this._frasesGeneradas;
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

if (typeof window.vigiaGenerator === 'undefined') {
    window.vigiaGenerator = new VigiaGenerator();
}

if (window.vigiaGramatical) {
    window.vigiaGenerator.init(window.vigiaGramatical);
} else {
    const checkInterval = setInterval(() => {
        if (window.vigiaGramatical) {
            clearInterval(checkInterval);
            window.vigiaGenerator.init(window.vigiaGramatical);
        }
    }, 500);
    setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.vigiaGenerator._initDone) {
            window.vigiaGenerator.init();
        }
    }, 10000);
}

const vigiaGenerator = window.vigiaGenerator;

console.log('✅ Vigía Generator v6.1 - DEFINITIVO (SIN TRADUCCIÓN)');
console.log('  🔥 Genera SOLO frases en idioma objetivo');
console.log('  📚 SIN traducción - la UI la pide con Groq');
console.log('  ✅ NO devuelve undefined');