// ============================================================
// MODO INVERSO v2.0 - CORREGIDO PARA JEROGLÍFICOS Y VALIDACIÓN
// ============================================================

class ModoInverso {
    constructor() {
        this._activo = false;
        this._idiomaNativo = 'es';
        this._idiomaObjetivo = 'en';
        this._initDone = false;
        this._idiomasJeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean'];
    }

    async init() {
        if (this._initDone) return this;
        
        try {
            const saved = localStorage.getItem('pipeline_modo_inverso');
            if (saved !== null) {
                this._activo = saved === 'true';
            }
            
            const usuario = await db.getUsuario();
            if (usuario) {
                this._idiomaNativo = usuario.idiomaNativo || 'es';
                const idiomasObj = usuario.idiomasObjetivo || [];
                if (idiomasObj.length > 0) {
                    this._idiomaObjetivo = idiomasObj[0].idioma || 'en';
                }
            }
            
            this._initDone = true;
            console.log('🔄 Modo Inverso:', this._activo ? '✅ ACTIVADO' : '❌ Desactivado');
            console.log(`   ${this._idiomaObjetivo} ↔ ${this._idiomaNativo}`);
        } catch (e) {
            console.warn('⚠️ Error iniciando Modo Inverso:', e);
            this._initDone = true;
        }
        
        return this;
    }

    toggle() {
        this._activo = !this._activo;
        localStorage.setItem('pipeline_modo_inverso', String(this._activo));
        
        window.dispatchEvent(new CustomEvent('modoInversoChange', {
            detail: { activo: this._activo }
        }));
        
        return this._activo;
    }

    isActivo() {
        return this._activo;
    }

    esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._idiomasJeroglificos.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    getFraseParaEstudio(frase) {
        const idioma = frase.idioma || this._idiomaObjetivo;
        const esJeroglifico = this.esJeroglifico(idioma);
        
        if (this._activo) {
            return {
                mostrar: frase.traduccion,
                ocultar: frase.original,
                esInverso: true,
                esJeroglifico: esJeroglifico,
                respuestaEsperada: frase.original,
                pistaFonetica: frase.pinyinCompleto || frase.segmentacion?.pinyin || null
            };
        } else {
            return {
                mostrar: frase.original,
                ocultar: frase.traduccion,
                esInverso: false,
                esJeroglifico: esJeroglifico,
                respuestaEsperada: frase.traduccion,
                pistaFonetica: null
            };
        }
    }

    // ============================================================
    // 🔥 VALIDACIÓN DE RESPUESTA - CORREGIDO PARA JEROGLÍFICOS
    // ============================================================

    validarRespuesta(respuesta, frase) {
        const idioma = frase.idioma || this._idiomaObjetivo;
        const esJeroglifico = this.esJeroglifico(idioma);
        
        let correcta;
        if (this._activo) {
            correcta = frase.original;
        } else {
            correcta = frase.traduccion;
        }
        
        const respuestaNormalizada = respuesta.trim().toLowerCase();
        const correctaNormalizada = correcta.trim().toLowerCase();
        
        const esExacto = respuestaNormalizada === correctaNormalizada;
        let esAproximado = false;
        let sugerencias = [];
        let puntuacion = 0;

        // ============================================================
        // 🔥 PARA JEROGLÍFICOS EN MODO INVERSO: ACEPTAR PINYIN
        // ============================================================
        if (!esExacto && esJeroglifico && this._activo) {
            const pinyinFrase = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
            if (pinyinFrase) {
                const pinyinNormalizado = pinyinFrase.toLowerCase()
                    .replace(/[0-9]/g, '')
                    .replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e')
                    .replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o')
                    .replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü')
                    .trim();
                
                const respPinyin = respuestaNormalizada
                    .replace(/[0-9]/g, '')
                    .replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e')
                    .replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o')
                    .replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü')
                    .trim();
                
                if (respPinyin === pinyinNormalizado || 
                    respPinyin.includes(pinyinNormalizado) ||
                    pinyinNormalizado.includes(respPinyin)) {
                    esAproximado = true;
                    puntuacion = 70;
                    sugerencias.push('💡 Has escrito pinyin. La respuesta exacta en hanzi es: ' + correcta);
                    sugerencias.push('💡 Prueba a escribir los caracteres hanzi para obtener la puntuación completa');
                }
            }
            
            if (!esAproximado && /[\u4e00-\u9fff]/.test(respuesta)) {
                const similitud = this._calcularSimilitudHanzi(respuesta, correcta);
                if (similitud > 0.7) {
                    esAproximado = true;
                    puntuacion = Math.round(similitud * 80);
                    sugerencias.push(`🟡 ${Math.round(similitud * 100)}% coincidencia. Revisa la escritura: "${correcta}"`);
                }
            }
        }

        // ============================================================
        // 🔥 PARA IDIOMAS NO JEROGLÍFICOS: VALIDACIÓN ESTÁNDAR
        // ============================================================
        if (!esExacto && !esJeroglifico) {
            const similitud = this._calcularSimilitudLevenshtein(respuestaNormalizada, correctaNormalizada);
            if (similitud > 0.85) {
                esAproximado = true;
                puntuacion = Math.round(similitud * 100);
                sugerencias.push('🟡 Muy cerca. Revisa pequeños detalles.');
            } else if (similitud > 0.6) {
                esAproximado = true;
                puntuacion = Math.round(similitud * 70);
                sugerencias.push('🟡 Aproximado, pero puedes mejorar.');
            }
        }

        return {
            correcto: esExacto,
            aproximado: esAproximado,
            correctaEsperada: correcta,
            modo: this._activo ? 'inverso' : 'normal',
            esJeroglifico: esJeroglifico,
            sugerencias: sugerencias,
            puntuacion: esExacto ? 100 : (esAproximado ? puntuacion : 0)
        };
    }

    _calcularSimilitudHanzi(a, b) {
        const charsA = new Set(a);
        const charsB = new Set(b);
        const comunes = new Set([...charsA].filter(x => charsB.has(x)));
        const total = Math.max(charsA.size, charsB.size);
        return total > 0 ? comunes.size / total : 0;
    }

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

    getDescripcion() {
        const nativo = this._idiomaNativo;
        const objetivo = this._idiomaObjetivo;
        if (this._activo) {
            return `🔄 ${nativo} → ${objetivo}`;
        }
        return `🔄 ${objetivo} → ${nativo}`;
    }

    getLabel() {
        return this._activo ? '🔄 Inverso' : '🔄 Normal';
    }

    getTooltip() {
        const nativo = this._idiomaNativo;
        const objetivo = this._idiomaObjetivo;
        if (this._activo) {
            return `Traduces de ${nativo} a ${objetivo}`;
        }
        return `Traduces de ${objetivo} a ${nativo}`;
    }

    getIcono() {
        return this._activo ? '🔄' : '📖';
    }

    getColor() {
        return this._activo ? 'var(--secondary)' : 'var(--primary)';
    }

    getPista(frase) {
        const data = this.getFraseParaEstudio(frase);
        
        if (this._activo && data.esJeroglifico && data.pistaFonetica) {
            return `💡 Pista fonética: "${data.pistaFonetica}"`;
        }
        
        if (this._activo) {
            return `💡 Traduce al idioma objetivo: ${this._idiomaObjetivo}`;
        }
        
        return `💡 Traduce al español: ${this._idiomaNativo}`;
    }
}

const modoInverso = new ModoInverso();
console.log('✅ Modo Inverso v2.0 - CORREGIDO: Validación para jeroglíficos y pinyin');