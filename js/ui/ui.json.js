// ============================================================
// UI JSON v22.0 - CON SOPORTE PARA VERSIONES DE ESTÁNDAR
// ============================================================

class UIJSON {
    constructor() {
        this.MAX_HISTORIAS = 10;
        this.MAX_FRASES_POR_HISTORIA = 10;
        this.IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._core = null;
        this._idiomaActual = null;
        this._nivelActual = null;
        this._familiaGenerada = null;
        this._idiomaNativo = 'es';
        
        // ============================================================
        // 🔥 NUEVO: TEMAS POR VERSIÓN
        // ============================================================
        this._TEMAS_POR_VERSION = {
            'v2.0': { // HSK 2.0
                'A1': 8,
                'A2': 8,
                'B1': 8,
                'B2': 8,
                'C1': 5,
                'C2': 4
            },
            'v3.0': { // HSK 3.0
                'A1': 12,
                'A2': 12,
                'B1': 10,
                'B2': 10,
                'C1': 6,
                'C2': 5
            },
            'default': {
                'A1': 8,
                'A2': 8,
                'B1': 8,
                'B2': 8,
                'C1': 5,
                'C2': 4
            }
        };
        
        this._FAMILIAS_SEMANTICAS = [
            'Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar',
            'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima',
            'Salud', 'Trabajo', 'Educación', 'Deportes',
            'Arte', 'Música', 'Tecnología', 'Viajes',
            'Compras', 'Comunicación', 'Emociones', 'Rutina',
            'Ciudad', 'Cultura', 'Historia', 'Ciencia'
        ];
        
        this._CARACTERES_COMUNES = ['的', '了', '在', '是', '有', '和', '与', '这', '那', '一', '不', '也', '都', '很', '我', '你', '他', '她', '们', '个', '就', '过', '着', '把', '被', '让', '给', '去', '来', '上', '下', '中', '大', '小', '多', '少', '人', '日', '月', '年', '时', '分', '点', '到', '对', '会', '可', '以', '为', '要', '能', '得', '所', '之', '而', '但', '却', '只', '还', '才', '更', '最', '等', '又', '也', '就', '说', '看', '听', '走', '跑', '坐', '站', '吃', '喝', '睡', '想', '要', '用', '出', '入', '回', '开', '关', '见', '问', '答', '知', '道', '觉', '得', '感', '觉', '认', '为', '觉', '得', '希', '望', '喜', '欢', '爱'];
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this.IDIOMAS_JEROGLIFICOS.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    async _obtenerIdiomaNativo() {
        try {
            const usuario = await db.getUsuario();
            if (usuario?.idiomaNativo) {
                this._idiomaNativo = usuario.idiomaNativo;
                return this._idiomaNativo;
            }
            const localData = localStorage.getItem('pipeline_usuario');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed?.idiomaNativo) {
                    this._idiomaNativo = parsed.idiomaNativo;
                    return this._idiomaNativo;
                }
            }
            return 'es';
        } catch (e) {
            return 'es';
        }
    }

    _getNombreIdioma(idioma) {
        const nombres = {
            'es': 'Español',
            'en': 'Inglés',
            'fr': 'Francés',
            'de': 'Alemán',
            'it': 'Italiano',
            'pt': 'Portugués',
            'zh': 'Chino',
            'ja': 'Japonés',
            'ko': 'Coreano',
            'ru': 'Ruso',
            'ar': 'Árabe',
            'hi': 'Hindi'
        };
        return nombres[idioma] || idioma;
    }

    // ============================================================
    // 🔥 NUEVO: OBTENER VERSIÓN DEL ESTÁNDAR
    // ============================================================

    _obtenerVersionEstandar(idioma) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerVersionActiva === 'function') {
            return window.gestorIdiomas.obtenerVersionActiva(idioma);
        }
        return 'v3.0'; // Por defecto usar la última versión
    }

    _obtenerNombreVersion(idioma, version) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerNombreVersion === 'function') {
            return window.gestorIdiomas.obtenerNombreVersion(idioma, version);
        }
        return version;
    }

    _obtenerPalabrasRequeridas(idioma, version, nivel) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerPalabrasRequeridas === 'function') {
            return window.gestorIdiomas.obtenerPalabrasRequeridas(idioma, version, nivel);
        }
        // Fallback: usar la tabla de palabras por nivel
        const palabrasPorNivel = {
            'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000
        };
        return palabrasPorNivel[nivel] || 2000;
    }

    _calcularNumeroTemas(version, nivel) {
        const versionData = this._TEMAS_POR_VERSION[version] || this._TEMAS_POR_VERSION['default'];
        return versionData[nivel] || versionData['A1'];
    }

    // ============================================================
    // INIT
    // ============================================================

    async init(core) {
        this._core = core;
        await this._obtenerIdiomaNativo();
        this._configurarJSON();
        this._actualizarIdiomaYNivel();
        return this;
    }

    _actualizarIdiomaYNivel() {
        this._idiomaActual = gestorIdiomas?.getIdiomaActivo() || 'es';
        const info = gestorIdiomas?.getInfoIdioma(this._idiomaActual);
        this._nivelActual = info?.nivel || 'A1';
        return { idioma: this._idiomaActual, nivel: this._nivelActual };
    }

    _configurarJSON() {
        const copyBtn = document.getElementById('jsonCopy');
        const importBtn = document.getElementById('jsonImport');
        
        if (copyBtn) {
            const newCopyBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
            newCopyBtn.addEventListener('click', () => {
                const textarea = document.getElementById('jsonTextarea');
                if (textarea) {
                    navigator.clipboard.writeText(textarea.value)
                        .then(() => this._core?.mostrarToast('📋 Copiado al portapapeles', 'success'))
                        .catch(() => {
                            textarea.select();
                            document.execCommand('copy');
                            this._core?.mostrarToast('📋 Copiado al portapapeles', 'success');
                        });
                }
            });
        }

        if (importBtn) {
            const newImportBtn = importBtn.cloneNode(true);
            importBtn.parentNode.replaceChild(newImportBtn, importBtn);
            newImportBtn.addEventListener('click', () => {
                this._handleImportJSON();
            });
        }
    }

    // ============================================================
    // GENERAR JSON DESDE DASHBOARD (CON VERSIÓN)
    // ============================================================

    async generarJSONDesdeDashboard() {
        const temaInput = document.getElementById('jsonTemaInput');
        const numInput = document.getElementById('jsonNumInput');
        const descripcionInput = document.getElementById('jsonDescripcionInput');
        
        const { idioma: idiomaActivo, nivel } = this._actualizarIdiomaYNivel();
        const esJeroglifico = this._esJeroglifico(idiomaActivo);
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const nombreNativo = this._getNombreIdioma(this._idiomaNativo);
        
        // 🔥 OBTENER VERSIÓN DEL ESTÁNDAR
        const versionEstandar = this._obtenerVersionEstandar(idiomaActivo);
        const nombreVersion = this._obtenerNombreVersion(idiomaActivo, versionEstandar);
        const palabrasRequeridas = this._obtenerPalabrasRequeridas(idiomaActivo, versionEstandar, nivel);
        const numTemasRecomendados = this._calcularNumeroTemas(versionEstandar, nivel);
        
        let tema = temaInput ? temaInput.value.trim() : '';
        let num = numInput ? numInput.value.trim() : '';
        let descripcion = descripcionInput ? descripcionInput.value.trim() : '';
        
        if (!tema) {
            tema = await this._core?.prompt(`📝 Tema para ${nombreIdioma} (${nivel}) - ${nombreVersion}:`, 'aventuras en la ciudad', 'Escribe un tema...', '📝');
            if (!tema) return;
            if (temaInput) temaInput.value = tema;
        }

        let numInt = parseInt(num) || 3;
        if (isNaN(numInt) || numInt < 1) numInt = 3;
        if (numInt > this.MAX_HISTORIAS) {
            numInt = this.MAX_HISTORIAS;
            if (numInput) numInput.value = this.MAX_HISTORIAS;
            await this._core?.alert('⚠️ El número máximo de historias es ' + this.MAX_HISTORIAS + '. Se ha ajustado automáticamente.', 'Límite');
        }

        // 🔥 Si el usuario no especificó número, usar el recomendado para la versión
        if (!num || num === '3') {
            numInt = numTemasRecomendados;
            if (numInput) numInput.value = numInt;
        }

        try {
            this._core?.mostrarToast(`🧠 Tutor Neuroadaptativo: Generando plantilla para ${nombreIdioma} (${nivel}) con ${nombreVersion}...`, 'info');
            
            let instruccionesTranscripcion = '';
            
            if (esJeroglifico) {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA IDIOMAS JEROGLÍFICOS:
                    - Incluye 'pinyin' CON TONOS para CADA frase y CADA palabra.
                    - La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente.
                    - Ejemplo: "你好" → "nǐ hǎo"
                    - Ejemplo de segmentacion: {"hanzi": "我 爱 你", "pinyin": "wǒ ài nǐ"}
                `;
            } else {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA TRANSCRIPCIÓN FONÉTICA:
                    - Incluye 'transcripcion' para CADA frase y CADA palabra.
                    - La transcripción debe estar en el sistema fonético NATIVO del usuario (${nombreNativo}).
                    - Debe ser FÁCIL DE LEER para un hablante nativo de ${nombreNativo}.
                    - Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).
                    - Ejemplo: "Je suis fatigué" → transcripción: "she sui fatige" (para español).
                    - Ejemplo: "Ich bin müde" → transcripción: "ij bin mude" (para español).
                    - Separa las sílabas con espacios para facilitar la lectura.
                    - Usa la aproximación más cercana para sonidos que no existen en ${nombreNativo}.
                    - Para cada palabra, la transcripción debe reflejar su pronunciación individual.
                `;
            }

            const instrucciones = [
                `1. Genera ${numInt} mini-historias cortas y coherentes sobre el tema: '${tema}'.`,
                `2. El nivel de dificultad es ${nivel}.`,
                `3. La versión del estándar es ${nombreVersion} (${versionEstandar}).`,
                `4. Este nivel requiere aproximadamente ${palabrasRequeridas} palabras en total.`,
                `5. Cada historia debe tener entre 6 y ${this.MAX_FRASES_POR_HISTORIA} frases en ${idiomaActivo}.`,
                `6. Cada frase debe tener: 'original', 'traduccion'`,
                `7. ⚠️ IMPORTANTE: Para CADA frase, incluye 'regla_gramatical' con el nombre de la regla gramatical que se usa en la frase (ej: "Pretérito Perfecto", "Concordancia de género", "Uso de preposiciones").`,
                `8. Para CADA frase, incluye 'explicacion_gramatical' con una explicación detallada en ${nombreNativo} de la regla, adaptada al nivel ${nivel}.`,
                `9. Para CADA frase, incluye 'tipo_regla' con la categoría de la regla (ej: "tiempo_verbal", "estructura_oracional", "concordancia", "uso_preposicional").`,
                `10. ${instruccionesTranscripcion}`,
                `11. Para CADA frase, las 'palabras' deben incluir su transcripción individual (pinyin o fonética según el idioma).`
            ];
            
            if (descripcion) {
                instrucciones.push(`12. ⚠️ IMPORTANTE: Utiliza esta descripción detallada para dar contexto y riqueza a las historias: "${descripcion}"`);
                instrucciones.push(`13. Cada historia debe reflejar los detalles y la ambientación descritos por el usuario.`);
            }
            
            if (esJeroglifico) {
                const idx = instrucciones.length;
                instrucciones.push(
                    `${idx+1}. ⚠️ IMPORTANTE: Para CADA frase, proporciona 'pinyin' CON TONOS (ej: "nǐ hǎo")`,
                    `${idx+2}. La 'segmentacion' debe separar CADA palabra con significado semántico (ej: "我 爱 你")`,
                    `${idx+3}. En 'palabras', cada entrada debe tener 'hanzi' y 'pinyin' con tonos (ej: "nǐ")`,
                    `${idx+4}. El pinyin DEBE incluir los números de tono (ma1, ma2, ma3, ma4) o diacríticos (mā, má, mǎ, mà)`,
                    `${idx+5}. Las palabras DEBEN tener su pinyin correspondiente para poder ser estudiadas correctamente`,
                    `${idx+6}. ⚠️ IMPORTANTE: Genera una sección 'caracteres_destacados' con los caracteres clave del tema, incluyendo:`,
                    `    - 'caracter': el carácter en sí`,
                    `    - 'pinyin': pronunciación con tonos`,
                    `    - 'significado': significado en ${nombreNativo}`,
                    `    - 'frecuencia': número de veces que aparece`,
                    `    - 'trazos': número de trazos`,
                    `    - 'radical': radical del carácter`,
                    `    - 'palabras_relacionadas': array de palabras que usan este carácter`,
                    `    - 'frases_de_la_historia': frases donde aparece el carácter`,
                    `    - 'nivel_sugerido': nivel MCER`,
                    `    - 'familia_semantica': categoría semántica`
                );
            } else {
                instrucciones.push(
                    `8. Cada frase debe tener 'palabras' con 'familia', 'tipo', 'significado' y 'transcripcion' en ${nombreNativo}`
                );
            }
            
            const plantilla = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "22.0",
                    "accion": "Completar este JSON con mini-historias para aprendizaje de idiomas",
                    "idioma_objetivo": idiomaActivo,
                    "nombre_idioma": nombreIdioma,
                    "nivel": nivel,
                    "tema": tema,
                    "num_historias": numInt,
                    "max_historias": this.MAX_HISTORIAS,
                    "max_frases_por_historia": this.MAX_FRASES_POR_HISTORIA,
                    "es_jeroglifico": esJeroglifico,
                    "idioma_nativo": this._idiomaNativo,
                    "nombre_nativo": nombreNativo,
                    // 🔥 NUEVO: CAMPOS DE VERSIÓN
                    "version_estandar": versionEstandar,
                    "nombre_version": nombreVersion,
                    "palabras_requeridas": palabrasRequeridas,
                    "num_temas_recomendados": numTemasRecomendados,
                    "descripcion_detallada": descripcion || null,
                    "instrucciones": instrucciones,
                    "formato_palabras": esJeroglifico ? {
                        "hanzi": "El carácter en el idioma objetivo (ej: 我)",
                        "pinyin": "Pronunciación con tonos (ej: wǒ)",
                        "familia": "Familia SEMÁNTICA",
                        "tipo": "Categoría GRAMATICAL",
                        "significado": `Traducción al ${nombreNativo}`
                    } : {
                        "palabra": "La palabra en el idioma objetivo",
                        "transcripcion": `Transcripción fonética en ${nombreNativo} (ej: "ai" para "I")`,
                        "familia": "Familia SEMÁNTICA",
                        "tipo": "Categoría GRAMATICAL",
                        "significado": `Traducción al ${nombreNativo}`
                    },
                    "campos_gramaticales": {
                        "regla_gramatical": "Nombre de la regla gramatical (ej: Pretérito Perfecto)",
                        "explicacion_gramatical": `Explicación detallada en ${nombreNativo} adaptada al nivel`,
                        "tipo_regla": "Categoría: tiempo_verbal, estructura_oracional, concordancia, uso_preposicional, etc."
                    },
                    "campos_transcripcion": esJeroglifico ? {
                        "frase": "pinyin con tonos",
                        "palabra": "pinyin con tonos",
                        "segmentacion": "hanzi y pinyin separados"
                    } : {
                        "frase": `transcripcion en ${nombreNativo}`,
                        "palabra": `transcripcion en ${nombreNativo}`
                    }
                },
                "meta": {
                    "tema": tema,
                    "num_historias": numInt,
                    "idioma": idiomaActivo,
                    "nombre_idioma": nombreIdioma,
                    "es_jeroglifico": esJeroglifico,
                    "nivel": nivel,
                    "idioma_nativo": this._idiomaNativo,
                    "nombre_nativo": nombreNativo,
                    "max_historias": this.MAX_HISTORIAS,
                    "max_frases_por_historia": this.MAX_FRASES_POR_HISTORIA,
                    "requiere_pinyin": esJeroglifico,
                    "requiere_transcripcion": !esJeroglifico,
                    "sistema_tonos": esJeroglifico ? "números (ma1, ma2, ma3, ma4) o diacríticos (mā, má, mǎ, mà)" : null,
                    // 🔥 NUEVO: VERSIÓN EN META
                    "version_estandar": versionEstandar,
                    "nombre_version": nombreVersion,
                    "palabras_requeridas": palabrasRequeridas,
                    "num_temas_recomendados": numTemasRecomendados,
                    "fecha_generacion": new Date().toISOString(),
                    "neuro_version": "22.0",
                    "incluye_gramatica": true,
                    "incluye_transcripcion": true,
                    "descripcion": descripcion || null
                },
                "historias": []
            };

            // Crear historias con placeholders
            for (let i = 1; i <= numInt; i++) {
                const historia = { 
                    id: i, 
                    titulo: `Historia ${i} sobre ${tema} (cámbialo por uno creativo)`, 
                    frases: [] 
                };
                for (let j = 1; j <= 7; j++) {
                    const frase = { 
                        original: `Frase ${j} en ${idiomaActivo} sobre ${tema}`, 
                        traduccion: `Traducción al ${nombreNativo} de la frase ${j}`,
                        regla_gramatical: `[Ej: Pretérito Perfecto, Concordancia, etc.]`,
                        explicacion_gramatical: `[Explicación detallada de la regla en ${nombreNativo}, nivel ${nivel}]`,
                        tipo_regla: `[tiempo_verbal, estructura_oracional, concordancia, uso_preposicional, etc.]`
                    };
                    
                    if (esJeroglifico) {
                        frase.pinyin = "pinyin_con_tonos_ejemplo";
                        frase.segmentacion = {
                            hanzi: "分 词 示 例",
                            pinyin: "fēn cí shì lì"
                        };
                        frase.palabras = [
                            { 
                                hanzi: "示例", 
                                pinyin: "shì lì", 
                                familia: "ejemplo_semantico", 
                                tipo: "sustantivo", 
                                significado: `significado de ejemplo en ${nombreNativo}` 
                            }
                        ];
                    } else {
                        frase.transcripcion = `[transcripcion_en_${nombreNativo}_de_la_frase_${j}]`;
                        frase.palabras = [
                            { 
                                palabra: `ejemplo_${j}`, 
                                transcripcion: `[transcripcion_en_${nombreNativo}_de_ejemplo_${j}]`,
                                familia: "ejemplo_semantico", 
                                tipo: "sustantivo", 
                                significado: `significado de ejemplo en ${nombreNativo}` 
                            }
                        ];
                    }
                    historia.frases.push(frase);
                }
                plantilla.historias.push(historia);
            }

            this._core?.abrirModal(`📄 Plantilla para ${nombreIdioma} (${nivel}) - ${nombreVersion}`);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.value = JSON.stringify(plantilla, null, 2);
                textarea.readOnly = false;
                textarea.style.minHeight = '450px';
            }
            
            const importBtn = document.getElementById('jsonImport');
            if (importBtn) {
                const newImportBtn = importBtn.cloneNode(true);
                importBtn.parentNode.replaceChild(newImportBtn, importBtn);
                
                newImportBtn.onclick = async function() {
                    const jsonText = document.getElementById('jsonTextarea').value;
                    if (jsonText) {
                        try {
                            const data = JSON.parse(jsonText);
                            if (data._INSTRUCCIONES_PARA_IA) {
                                const tieneHistorias = data.historias && data.historias.length > 0 && 
                                                       data.historias[0].frases && data.historias[0].frases.length > 0;
                                
                                let tieneDatosReales = false;
                                if (tieneHistorias) {
                                    const primeraFrase = data.historias[0].frases[0];
                                    if (primeraFrase && primeraFrase.original && 
                                        !primeraFrase.original.startsWith('Frase')) {
                                        tieneDatosReales = true;
                                    }
                                }
                                
                                if (tieneDatosReales) {
                                    await window.UIJSON._handleImportJSON();
                                } else {
                                    window.UIJSON._core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Pide a la IA que la complete y luego importa.', 'warning');
                                }
                            } else {
                                await window.UIJSON._handleImportJSON();
                            }
                        } catch (e) {
                            window.UIJSON._core?.mostrarToast('❌ Error: ' + e.message, 'error');
                        }
                    }
                };
            }

            document.getElementById('jsonImport').style.display = 'block';
            
            const mensajeExtra = esJeroglifico ? 
                '⚠️ IMPORTANTE: El JSON incluye campos para PINYIN con tonos.' : 
                `🎤 IMPORTANTE: El JSON incluye campos para TRANSCRIPCIÓN FONÉTICA en ${nombreNativo}.`;
            
            this._core?.mostrarToast(`✅ Plantilla del Tutor Neuroadaptativo generada para ${nombreIdioma} (${nivel}) con ${nombreVersion}`, 'success');
            this._core?.mostrarToast(`📊 ${numTemasRecomendados} temas recomendados para cubrir las ${palabrasRequeridas} palabras`, 'info');
            this._core?.mostrarToast(mensajeExtra, 'warning');
            
            if (esJeroglifico) {
                this._core?.mostrarToast('🀄 Después de importar, ve al Módulo de Caracteres para estudiar las familias', 'info');
            } else {
                this._core?.mostrarToast('🎤 Después de importar, ve al Módulo de Fonética para practicar la pronunciación', 'info');
            }
            
        } catch (error) {
            await this._core?.alert('❌ Error: ' + error.message, 'Error');
        }
    }

    // ============================================================
    // GENERAR FAMILIA DE CARACTERES DESDE DASHBOARD
    // ============================================================

    async generarFamiliaCaracteresDesdeDashboard() {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const esJeroglifico = this._esJeroglifico(idioma);
        const nombreNativo = this._getNombreIdioma(this._idiomaNativo);
        
        if (!esJeroglifico) {
            await this._core?.alert(
                `❌ El idioma "${this._getNombreIdioma(idioma)}" no es jeroglífico.\n\n` +
                `Este botón genera una plantilla para crear una familia de caracteres (carácter raíz + palabras derivadas).\n` +
                `Solo está disponible para idiomas jeroglíficos como Chino, Japonés o Coreano.`,
                '⚠️ Idioma no compatible'
            );
            return;
        }
        
        // 🔥 OBTENER VERSIÓN
        const versionEstandar = this._obtenerVersionEstandar(idioma);
        const nombreVersion = this._obtenerNombreVersion(idioma, versionEstandar);
        
        const temaInput = document.getElementById('jsonTemaInput');
        const tema = temaInput?.value?.trim() || 'vocabulario general';
        const nivel = this._nivelActual || 'A1';
        const idiomaNativo = this._idiomaNativo;
        const nombreIdioma = this._getNombreIdioma(idioma);
        const numPalabras = 5;
        
        let caracterSugerido = '';
        
        const temaLower = tema.toLowerCase();
        const mapaTemas = {
            'familia': '家', 'casa': '家', 'hogar': '家',
            'comida': '食', 'comer': '食', 'bebida': '饮',
            'amor': '爱', 'sentimiento': '爱', 'emoción': '心',
            'viaje': '行', 'viajes': '行', 'transport': '行',
            'estudio': '学', 'aprender': '学', 'educación': '学',
            'trabajo': '工', 'trabajar': '工', 'empleo': '工',
            'ciudad': '市', 'pueblo': '市', 'urbano': '市',
            'tiempo': '时', 'reloj': '时', 'hora': '时',
            'agua': '水', 'mar': '水', 'rio': '水',
            'fuego': '火', 'calor': '火',
            'persona': '人', 'gente': '人', 'humano': '人',
            'corazón': '心', 'mente': '心', 'pensar': '心',
            'sol': '日', 'día': '日', 'luz': '日',
            'luna': '月', 'mes': '月', 'noche': '月',
            'árbol': '木', 'madera': '木', 'bosque': '木',
            'oro': '金', 'metal': '金', 'dinero': '金',
            'tierra': '土', 'suelo': '土', 'terreno': '土'
        };
        
        for (const [key, value] of Object.entries(mapaTemas)) {
            if (temaLower.includes(key)) {
                caracterSugerido = value;
                break;
            }
        }
        
        if (!caracterSugerido) {
            caracterSugerido = await this._core?.prompt(
                `🀄 Introduce un carácter raíz para la familia\n\n` +
                `Ejemplos: 家 (familia), 学 (estudio), 食 (comida), 爱 (amor)`,
                '家',
                'Escribe un carácter...',
                '🀄 Carácter Raíz'
            );
            
            if (!caracterSugerido) return;
            caracterSugerido = caracterSugerido.trim();
        }
        
        if (!/[\u4e00-\u9fff]/.test(caracterSugerido)) {
            await this._core?.alert(
                `❌ "${caracterSugerido}" no parece ser un carácter chino válido.\n\n` +
                `Por favor, introduce un carácter chino como: 家, 学, 食, 爱, etc.`,
                '⚠️ Carácter inválido'
            );
            return;
        }
        
        const plantilla = this._generarPlantillaFamiliaCaracteres(
            caracterSugerido,
            tema,
            idioma,
            nivel,
            idiomaNativo,
            nombreIdioma,
            numPalabras,
            nombreNativo,
            versionEstandar,
            nombreVersion
        );
        
        this._core?.abrirModal(`🀄 Plantilla: Familia de Caracteres (${caracterSugerido}) - ${nombreVersion}`);
        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = JSON.stringify(plantilla, null, 2);
            textarea.readOnly = false;
            textarea.style.minHeight = '400px';
            textarea.style.fontSize = '12px';
            textarea.style.fontFamily = 'monospace';
        }
        
        const importBtn = document.getElementById('jsonImport');
        if (importBtn) {
            const newImportBtn = importBtn.cloneNode(true);
            importBtn.parentNode.replaceChild(newImportBtn, importBtn);
            
            newImportBtn.onclick = async function() {
                const jsonText = document.getElementById('jsonTextarea').value;
                if (!jsonText) {
                    window.UIJSON._core?.mostrarToast('❌ No hay JSON para importar', 'error');
                    return;
                }
                
                try {
                    const data = JSON.parse(jsonText);
                    
                    if (data._INSTRUCCIONES_PARA_IA && data.caracter_raiz && data.familia_palabras && Array.isArray(data.familia_palabras) && data.familia_palabras.length > 0) {
                        await window.UIJSON._importarFamiliaCaracteres(data);
                        window.UIJSON._core.cerrarModal();
                        window.UIJSON._core.mostrarToast('✅ Familia de caracteres importada correctamente', 'success');
                        
                        if (window.UICaracteres) window.UICaracteres.cargar(window.UIJSON._core);
                        if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
                        if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(window.UIJSON._core);
                        return;
                    }
                    
                    if (data._INSTRUCCIONES_PARA_IA) {
                        window.UIJSON._core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Pide a la IA que la complete y luego importa.', 'warning');
                        return;
                    }
                    
                    if (data.caracter_raiz && data.familia_palabras) {
                        await window.UIJSON._importarFamiliaCaracteres(data);
                        window.UIJSON._core.cerrarModal();
                        window.UIJSON._core.mostrarToast('✅ Familia de caracteres importada correctamente', 'success');
                        
                        if (window.UICaracteres) window.UICaracteres.cargar(window.UIJSON._core);
                        if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
                        if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(window.UIJSON._core);
                        return;
                    }
                    
                    window.UIJSON._core?.mostrarToast('❌ JSON inválido: faltan datos requeridos', 'error');
                    
                } catch (e) {
                    window.UIJSON._core?.mostrarToast('❌ Error al importar: ' + e.message, 'error');
                }
            };
        }
        
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            const infoDiv = document.createElement('div');
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
                <strong>🀄 Plantilla: Familia de Caracteres</strong><br>
                🌍 ${nombreIdioma} (${idioma}) · ${nivel}<br>
                📌 Carácter raíz: <strong>${caracterSugerido}</strong><br>
                📝 ${numPalabras} palabras derivadas · 📂 ${tema}<br>
                📌 Versión del estándar: <strong>${nombreVersion}</strong><br>
                <span style="font-size:11px;color:var(--gray-light);">
                    💡 Pide a la IA que complete el JSON y luego pulsa "Importar".
                </span>
                <br>
                <span style="font-size:10px;color:var(--gray-light);">
                    🔍 Ejemplo de prompt para IA:<br>
                    "Completa este JSON generando ${numPalabras} palabras que contengan el carácter ${caracterSugerido} en ${nombreIdioma}, nivel ${nivel}, tema ${tema}."
                </span>
                <br>
                <span style="font-size:10px;color:var(--success);">
                    ✅ El JSON completado se importará automáticamente aunque contenga _INSTRUCCIONES_PARA_IA
                </span>
            `;
            const modalBody = modalContent.querySelector('.modal-body');
            if (modalBody) {
                modalBody.insertBefore(infoDiv, modalBody.firstChild);
            }
        }
        
        this._core?.mostrarToast(`🀄 Tutor Neuroadaptativo: Plantilla generada para "${caracterSugerido}" con ${nombreVersion}`, 'success');
    }

    // ============================================================
    // GENERAR PLANTILLA DE FAMILIA DE CARACTERES (CON VERSIÓN)
    // ============================================================

    _generarPlantillaFamiliaCaracteres(caracter, tema, idioma, nivel, idiomaNativo, nombreIdioma, numPalabras, nombreNativo, versionEstandar, nombreVersion) {
        const familiasSemanticasList = this._FAMILIAS_SEMANTICAS.join(', ');
        const palabrasRequeridas = this._obtenerPalabrasRequeridas(idioma, versionEstandar, nivel);
        
        return {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "22.0",
                "accion": `Genera una familia de caracteres para el carácter "${caracter}" en ${nombreIdioma}`,
                "caracter_raiz": caracter,
                "tema": tema,
                "idioma_objetivo": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "nombre_nativo": nombreNativo,
                "num_palabras": numPalabras,
                "es_jeroglifico": true,
                // 🔥 NUEVO: VERSIÓN
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "instrucciones": [
                    `1. Investiga el carácter "${caracter}" en profundidad`,
                    `2. Proporciona su significado base en ${idiomaNativo}`,
                    `3. Incluye pinyin con tonos para el carácter raíz`,
                    `4. Genera ${numPalabras} palabras que CONTENGAN el carácter "${caracter}"`,
                    `5. Las palabras deben ser de nivel ${nivel} según el estándar ${nombreVersion}`,
                    `6. Para cada palabra, proporciona:`,
                    `   - 'palabra': la palabra en ${nombreIdioma}`,
                    `   - 'pinyin': pronunciación con tonos`,
                    `   - 'significado': significado en ${idiomaNativo}`,
                    `   - 'ejemplo_frase': frase de ejemplo en ${nombreIdioma}`,
                    `   - 'traduccion_frase': traducción al ${idiomaNativo}`,
                    `   - 'familia_semantica': asignar de esta lista: ${familiasSemanticasList}`,
                    `   - 'desglose_morfologico': explicación de cómo se forma la palabra`,
                    `7. Proporciona 'estructura' del carácter con radicales y trazos`,
                    `8. Incluye 'mnemotecnia' para recordar el carácter`,
                    `9. Si existe, incluye 'variantes' (tradicional/simplificado)`,
                    `10. NO incluyas el carácter raíz como palabra derivada`,
                    `11. Asegúrate de que el vocabulario cubra las ${palabrasRequeridas} palabras requeridas para el nivel ${nivel}`
                ],
                "familias_semanticas_disponibles": this._FAMILIAS_SEMANTICAS,
                "niveles_disponibles": this.NIVELES
            },
            "meta": {
                "caracter_raiz": caracter,
                "tema": tema,
                "idioma": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "nombre_nativo": nombreNativo,
                "num_palabras": numPalabras,
                // 🔥 NUEVO: VERSIÓN
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "fecha_generacion": new Date().toISOString(),
                "version": "22.0",
                "generado_por": "Pipeline Neuro - Tutor Neuroadaptativo"
            },
            "caracter_raiz": {
                "simbolo": caracter,
                "significado_base": `[Significado de "${caracter}" en ${idiomaNativo}]`,
                "pinyin": `[pinyin_con_tonos_para_${caracter}]`,
                "numero_trazos": 0,
                "estructura": {
                    "trazos_clave": [
                        {"nombre": "[Nombre del trazo 1]", "orden": 1},
                        {"nombre": "[Nombre del trazo 2]", "orden": 2}
                    ],
                    "radicales": ["[radical1]", "[radical2]"],
                    "tipo_estructura": "[izquierda-derecha/arriba-abajo/simple]"
                },
                "etimologia_breve": `[Origen y evolución de "${caracter}"]`,
                "mnemotecnia": `[Historia o pista para recordar "${caracter}"]`,
                "variantes": {
                    "tradicional": `[versión_tradicional_si_aplica]`,
                    "simplificado": `[versión_simplificada_si_aplica]`
                }
            },
            "familia_palabras": Array.from({ length: numPalabras }, (_, i) => ({
                "id": i + 1,
                "palabra": `[palabra_${i+1}_que_contiene_${caracter}]`,
                "pinyin": `[pinyin_de_palabra_${i+1}]`,
                "significado": `[significado_en_${idiomaNativo}]`,
                "ejemplo_frase": `[frase_ejemplo_en_${nombreIdioma}]`,
                "traduccion_frase": `[traduccion_al_${idiomaNativo}]`,
                "familia_semantica": `[asignar_de: ${familiasSemanticasList}]`,
                "desglose_morfologico": `[explicación_de_cómo_se_forma_la_palabra]`,
                "nivel_sugerido": nivel
            })),
            "conexiones": {
                "caracteres_relacionados": [
                    {"caracter": `[otro_caracter_relacionado]`, "relacion": "[cómo_se_relaciona]", "nivel": nivel}
                ],
                "temas_relacionados": [tema, "[tema_relacionado_2]"]
            },
            "ejercicios_sugeridos": {
                "tipo": "[ordenar_trazos/completar/asociacion]",
                "descripcion": "[Descripción del ejercicio]",
                "dificultad": nivel
            }
        };
    }

    // ============================================================
    // ABRIR GENERADOR JSON (CON VERSIÓN)
    // ============================================================

    async abrirGeneradorJSON() {
        const { idioma: idiomaActivo, nivel } = this._actualizarIdiomaYNivel();
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const nombreNativo = this._getNombreIdioma(this._idiomaNativo);
        const esJeroglifico = this._esJeroglifico(idiomaActivo);
        
        // 🔥 OBTENER VERSIÓN
        const versionEstandar = this._obtenerVersionEstandar(idiomaActivo);
        const nombreVersion = this._obtenerNombreVersion(idiomaActivo, versionEstandar);
        const palabrasRequeridas = this._obtenerPalabrasRequeridas(idiomaActivo, versionEstandar, nivel);
        const numTemasRecomendados = this._calcularNumeroTemas(versionEstandar, nivel);
        
        const tema = await this._core?.prompt(`📝 Tema para ${nombreIdioma} (${nivel}) - ${nombreVersion}:`, 'aventuras en la ciudad', 'Escribe un tema...', '📝');
        if (!tema) return;

        const num = await this._core?.prompt(`🔢 Número de mini-historias:\n\nRecomendado para ${nombreVersion}: ${numTemasRecomendados} temas\n\n(1-${this.MAX_HISTORIAS}):`, String(numTemasRecomendados), 'Número', '🔢');
        if (!num) return;

        const numInt = parseInt(num);
        if (isNaN(numInt) || numInt < 1 || numInt > this.MAX_HISTORIAS) {
            await this._core?.alert('❌ Número inválido. Debe ser entre 1 y ' + this.MAX_HISTORIAS + '.', 'Error');
            return;
        }

        try {
            this._core?.mostrarToast(`🧠 Tutor Neuroadaptativo: Generando plantilla para ${nombreIdioma} (${nivel}) con ${nombreVersion}...`, 'info');
            
            let instruccionesTranscripcion = '';
            
            if (esJeroglifico) {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA IDIOMAS JEROGLÍFICOS:
                    - Incluye 'pinyin' CON TONOS para CADA frase y CADA palabra.
                    - La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente.
                    - Ejemplo: "你好" → "nǐ hǎo"
                `;
            } else {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA TRANSCRIPCIÓN FONÉTICA:
                    - Incluye 'transcripcion' para CADA frase y CADA palabra.
                    - La transcripción debe estar en el sistema fonético NATIVO del usuario (${nombreNativo}).
                    - Debe ser FÁCIL DE LEER para un hablante nativo de ${nombreNativo}.
                    - Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).
                    - Separa las sílabas con espacios para facilitar la lectura.
                `;
            }
            
            const instrucciones = [
                `1. Genera ${numInt} mini-historias cortas y coherentes sobre el tema: '${tema}'.`,
                `2. El nivel de dificultad es ${nivel}.`,
                `3. La versión del estándar es ${nombreVersion} (${versionEstandar}).`,
                `4. Este nivel requiere aproximadamente ${palabrasRequeridas} palabras en total.`,
                `5. Cada historia debe tener entre 6 y ${this.MAX_FRASES_POR_HISTORIA} frases en ${idiomaActivo}.`,
                `6. Cada frase debe tener: 'original', 'traduccion'`,
                `7. ⚠️ IMPORTANTE: Para CADA frase, incluye 'regla_gramatical' con el nombre de la regla gramatical.`,
                `8. Para CADA frase, incluye 'explicacion_gramatical' en ${nombreNativo} adaptada al nivel ${nivel}.`,
                `9. Para CADA frase, incluye 'tipo_regla' con la categoría de la regla.`,
                `10. ${instruccionesTranscripcion}`,
                `11. Para CADA frase, las 'palabras' deben incluir su transcripción individual (pinyin o fonética según el idioma).`
            ];
            
            if (esJeroglifico) {
                instrucciones.push(
                    `12. ⚠️ IMPORTANTE: Genera una sección 'caracteres_destacados' con los caracteres clave del tema`,
                    `13. El pinyin DEBE incluir los números de tono (ma1, ma2, ma3, ma4) o diacríticos (mā, má, mǎ, mà)`
                );
            }
            
            const plantilla = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "22.0",
                    "accion": "Completar este JSON con mini-historias para aprendizaje de idiomas",
                    "idioma_objetivo": idiomaActivo,
                    "nombre_idioma": nombreIdioma,
                    "nivel": nivel,
                    "tema": tema,
                    "num_historias": numInt,
                    "max_historias": this.MAX_HISTORIAS,
                    "max_frases_por_historia": this.MAX_FRASES_POR_HISTORIA,
                    "es_jeroglifico": esJeroglifico,
                    "idioma_nativo": this._idiomaNativo,
                    "nombre_nativo": nombreNativo,
                    // 🔥 NUEVO: VERSIÓN
                    "version_estandar": versionEstandar,
                    "nombre_version": nombreVersion,
                    "palabras_requeridas": palabrasRequeridas,
                    "num_temas_recomendados": numTemasRecomendados,
                    "instrucciones": instrucciones,
                    "formato_palabras": esJeroglifico ? {
                        "hanzi": "El carácter en el idioma objetivo",
                        "pinyin": "Pronunciación con tonos (ej: nǐ hǎo)",
                        "familia": "Familia SEMÁNTICA",
                        "tipo": "Categoría GRAMATICAL",
                        "significado": `Traducción al ${nombreNativo}`
                    } : {
                        "palabra": "La palabra en el idioma objetivo",
                        "transcripcion": `Transcripción fonética en ${nombreNativo}`,
                        "familia": "Familia SEMÁNTICA",
                        "tipo": "Categoría GRAMATICAL",
                        "significado": `Traducción al ${nombreNativo}`
                    },
                    "campos_gramaticales": {
                        "regla_gramatical": "Nombre de la regla gramatical",
                        "explicacion_gramatical": `Explicación detallada en ${nombreNativo} adaptada al nivel`,
                        "tipo_regla": "Categoría: tiempo_verbal, estructura_oracional, concordancia, uso_preposicional, etc."
                    }
                },
                "meta": {
                    "tema": tema,
                    "num_historias": numInt,
                    "idioma": idiomaActivo,
                    "nombre_idioma": nombreIdioma,
                    "es_jeroglifico": esJeroglifico,
                    "nivel": nivel,
                    "idioma_nativo": this._idiomaNativo,
                    "nombre_nativo": nombreNativo,
                    "max_historias": this.MAX_HISTORIAS,
                    "max_frases_por_historia": this.MAX_FRASES_POR_HISTORIA,
                    "requiere_pinyin": esJeroglifico,
                    "requiere_transcripcion": !esJeroglifico,
                    "sistema_tonos": esJeroglifico ? "números (ma1, ma2, ma3, ma4) o diacríticos (mā, má, mǎ, mà)" : null,
                    // 🔥 NUEVO: VERSIÓN
                    "version_estandar": versionEstandar,
                    "nombre_version": nombreVersion,
                    "palabras_requeridas": palabrasRequeridas,
                    "num_temas_recomendados": numTemasRecomendados,
                    "fecha_generacion": new Date().toISOString(),
                    "neuro_version": "22.0",
                    "incluye_gramatica": true,
                    "incluye_transcripcion": true
                },
                "historias": []
            };

            if (esJeroglifico) {
                plantilla.caracteres_destacados = {
                    "_INSTRUCCIONES": {
                        "version": "2.0",
                        "accion": "Genera caracteres destacados para el tema",
                        "tema": tema,
                        "idioma": idiomaActivo,
                        "nivel": nivel,
                        "idioma_nativo": this._idiomaNativo,
                        "instrucciones": [
                            "1. Identifica los caracteres MÁS IMPORTANTES del tema",
                            "2. Para cada carácter, proporciona: 'caracter', 'pinyin', 'significado', 'frecuencia', 'palabras_relacionadas', 'frases_de_la_historia'"
                        ]
                    },
                    "lista": []
                };
            }

            for (let i = 1; i <= numInt; i++) {
                const historia = { 
                    id: i, 
                    titulo: `Historia ${i} sobre ${tema} (cámbialo por uno creativo)`, 
                    frases: [] 
                };
                for (let j = 1; j <= 7; j++) {
                    const frase = { 
                        original: `Frase ${j} en ${idiomaActivo} sobre ${tema}`, 
                        traduccion: `Traducción al ${nombreNativo} de la frase ${j}`,
                        regla_gramatical: `[Ej: Pretérito Perfecto, Concordancia, etc.]`,
                        explicacion_gramatical: `[Explicación detallada de la regla en ${nombreNativo}, nivel ${nivel}]`,
                        tipo_regla: `[tiempo_verbal, estructura_oracional, concordancia, uso_preposicional, etc.]`
                    };
                    
                    if (esJeroglifico) {
                        frase.pinyin = "pinyin_con_tonos_ejemplo";
                        frase.segmentacion = {
                            hanzi: "分 词 示 例",
                            pinyin: "fēn cí shì lì"
                        };
                        frase.palabras = [
                            { 
                                hanzi: "示例", 
                                pinyin: "shì lì", 
                                familia: "ejemplo_semantico", 
                                tipo: "sustantivo", 
                                significado: `significado de ejemplo en ${nombreNativo}` 
                            }
                        ];
                    } else {
                        frase.transcripcion = `[transcripcion_en_${nombreNativo}_de_la_frase_${j}]`;
                        frase.palabras = [
                            { 
                                palabra: `ejemplo_${j}`, 
                                transcripcion: `[transcripcion_en_${nombreNativo}_de_ejemplo_${j}]`,
                                familia: "ejemplo_semantico", 
                                tipo: "sustantivo", 
                                significado: `significado de ejemplo en ${nombreNativo}` 
                            }
                        ];
                    }
                    historia.frases.push(frase);
                }
                plantilla.historias.push(historia);
            }

            this._core?.abrirModal(`📄 Plantilla para ${nombreIdioma} (${nivel}) - ${nombreVersion}`);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.value = JSON.stringify(plantilla, null, 2);
                textarea.readOnly = false;
                textarea.style.minHeight = '450px';
            }
            
            document.getElementById('jsonImport').style.display = 'block';
            
            const mensajeExtra = esJeroglifico ? 
                '⚠️ IMPORTANTE: El JSON incluye campos para PINYIN con tonos.' : 
                `🎤 IMPORTANTE: El JSON incluye campos para TRANSCRIPCIÓN FONÉTICA en ${nombreNativo}.`;
            
            this._core?.mostrarToast(`✅ Plantilla del Tutor Neuroadaptativo generada para ${nombreIdioma} (${nivel}) con ${nombreVersion}`, 'success');
            this._core?.mostrarToast(`📊 ${numTemasRecomendados} temas recomendados para cubrir las ${palabrasRequeridas} palabras`, 'info');
            this._core?.mostrarToast(mensajeExtra, 'warning');
            
        } catch (error) {
            await this._core?.alert('❌ Error: ' + error.message, 'Error');
        }
    }

    async abrirImportadorJSON() {
        this._core?.abrirModal('📥 Importar JSON Completado');
        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = '';
            textarea.placeholder = 'Pega aquí el JSON completado por la IA...';
            textarea.readOnly = false;
            textarea.style.minHeight = '300px';
        }
        document.getElementById('jsonImport').style.display = 'block';
    }

    async importarJSONDesdeDashboard() {
        const textarea = document.getElementById('jsonPasteArea');
        if (!textarea) {
            await this._core?.alert('❌ No se encontró el área de pegado', 'Error');
            return;
        }
        
        const jsonText = textarea.value.trim();
        if (!jsonText) {
            await this._core?.alert('❌ No hay JSON para importar. Pega el JSON completado por la IA.', 'Error');
            return;
        }
        
        try {
            const data = JSON.parse(jsonText);
            
            const esFamiliaCaracteres = data.caracter_raiz && data.familia_palabras && Array.isArray(data.familia_palabras);
            
            if (esFamiliaCaracteres) {
                this._core?.mostrarToast('🀄 Tutor Neuroadaptativo: Importando Familia de Caracteres...', 'info');
                const modalTextarea = document.getElementById('jsonTextarea');
                if (modalTextarea) {
                    modalTextarea.value = jsonText;
                }
                await this._importarFamiliaCaracteres(data);
                textarea.value = '';
                return;
            }
            
            if (!data.meta || !data.historias || !Array.isArray(data.historias) || data.historias.length === 0) {
                await this._core?.alert('❌ JSON inválido o vacío. Asegúrate de que tenga "meta" e "historias".', 'Error');
                return;
            }
            
            if (data.historias.length > this.MAX_HISTORIAS) {
                await this._core?.alert('❌ Demasiadas historias. Máximo permitido: ' + this.MAX_HISTORIAS, 'Error');
                return;
            }
            
            for (let i = 0; i < data.historias.length; i++) {
                const frases = data.historias[i].frases || [];
                if (frases.length > this.MAX_FRASES_POR_HISTORIA) {
                    await this._core?.alert('❌ La historia ' + (i+1) + ' tiene ' + frases.length + ' frases. Máximo permitido: ' + this.MAX_FRASES_POR_HISTORIA, 'Error');
                    return;
                }
            }
            
            this._core?.mostrarToast('🔍 Verificando e importando...', 'info');
            
            const modalTextarea = document.getElementById('jsonTextarea');
            if (modalTextarea) {
                modalTextarea.value = jsonText;
            }
            
            await this._handleImportJSON();
            textarea.value = '';
            
            if (data.caracteres_destacados && window.UICaracteres) {
                setTimeout(() => {
                    window.UICaracteres.cargar(window.uiCore);
                }, 500);
            }
            
        } catch (error) {
            await this._core?.alert('❌ Error: ' + error.message, 'Error');
        }
    }

    // ============================================================
    // HANDLE IMPORT JSON (COMPLETO CON VERSIÓN)
    // ============================================================

    async _handleImportJSON() {
        const textarea = document.getElementById('jsonTextarea');
        if (!textarea) {
            await this._core?.alert('❌ No se encontró el área de texto del JSON.', 'Error');
            return;
        }

        const jsonText = textarea.value.trim();
        if (!jsonText) {
            await this._core?.alert('❌ No hay JSON para importar.', 'Error');
            return;
        }

        try {
            const data = JSON.parse(jsonText);
            console.log('📋 JSON parseado correctamente:', data);

            if (data.caracter_raiz && data.familia_palabras && Array.isArray(data.familia_palabras)) {
                console.log('🀄 Detectada Familia de Caracteres, importando...');
                await this._importarFamiliaCaracteres(data);
                return;
            }

            if (!data.meta || !data.historias || !Array.isArray(data.historias) || data.historias.length === 0) {
                await this._core?.alert('❌ JSON inválido o vacío. Asegúrate de que tenga "meta" e "historias".', 'Error');
                return;
            }

            const esJeroglifico = data.meta.es_jeroglifico || this._esJeroglifico(data.meta.idioma);
            const idiomaNativo = data.meta.idioma_nativo || this._idiomaNativo;
            
            // 🔥 VERIFICAR VERSIÓN
            const versionEstandar = data.meta.version_estandar || this._obtenerVersionEstandar(data.meta.idioma);
            const nombreVersion = data.meta.nombre_version || this._obtenerNombreVersion(data.meta.idioma, versionEstandar);
            
            console.log(`📌 Versión del estándar en JSON: ${versionEstandar} (${nombreVersion})`);
            
            let tieneTranscripciones = false;
            let frasesSinTranscripcion = 0;
            
            for (const historia of data.historias) {
                for (const frase of (historia.frases || [])) {
                    if (esJeroglifico) {
                        if (frase.pinyin) tieneTranscripciones = true;
                        else frasesSinTranscripcion++;
                    } else {
                        if (frase.transcripcion) tieneTranscripciones = true;
                        else frasesSinTranscripcion++;
                    }
                }
            }
            
            if (!tieneTranscripciones && frasesSinTranscripcion > 0) {
                const confirmar = await this._core?.confirm(
                    `⚠️ El JSON no contiene transcripciones fonéticas (${frasesSinTranscripcion} frases sin transcripción).\n\n` +
                    `${esJeroglifico ? 'Se esperaba "pinyin" con tonos.' : `Se esperaba "transcripcion" en ${this._getNombreIdioma(idiomaNativo)}.`}\n\n` +
                    `¿Quieres importarlo de todas formas?\n\n` +
                    `💡 Puedes generar la transcripción después desde el Módulo de Fonética.`,
                    '⚠️ Transcripciones Faltantes'
                );
                if (!confirmar) return;
            }

            if (data.historias.length > this.MAX_HISTORIAS) {
                await this._core?.alert('❌ Demasiadas historias. Máximo permitido: ' + this.MAX_HISTORIAS, 'Error');
                return;
            }
            
            for (let i = 0; i < data.historias.length; i++) {
                const frases = data.historias[i].frases || [];
                if (frases.length > this.MAX_FRASES_POR_HISTORIA) {
                    await this._core?.alert('❌ La historia ' + (i+1) + ' tiene ' + frases.length + ' frases. Máximo permitido: ' + this.MAX_FRASES_POR_HISTORIA, 'Error');
                    return;
                }
            }

            this._core?.mostrarToast('🔍 Verificando duplicados...', 'info');
            
            const frasesExistentes = await db.obtenerFrases();
            const palabrasExistentes = await db.obtenerPalabras();
            const historiasExistentes = await db.obtenerHistorias();
            
            const idioma = data.meta.idioma || 'es';
            const nivel = data.meta.nivel || 'B1';
            
            let temaId = data.meta?.tema_id || null;
            let temaIdReal = null;
            let temaGuardado = null;
            
            if (temaId && window.UITemas?._temaPredefinidoIdMap) {
                const dbId = window.UITemas._temaPredefinidoIdMap[temaId];
                if (dbId) {
                    temaGuardado = await db.obtenerTema(dbId);
                    if (temaGuardado) {
                        temaIdReal = temaGuardado.id;
                        console.log(`📂 Tema encontrado en mapa: ${temaId} -> ${temaIdReal}`);
                    }
                }
            }
            
            if (!temaGuardado) {
                const temasExistentes = await db.obtenerTemas();
                temaGuardado = temasExistentes.find(t => t.nombre === data.meta.tema);
                if (temaGuardado) {
                    temaIdReal = temaGuardado.id;
                    console.log(`📂 Tema encontrado por nombre: ${temaGuardado.nombre} -> ${temaIdReal}`);
                }
            }
            
            if (!temaGuardado) {
                let temasExistentes = await db.obtenerTemas();
                
                if (temasExistentes.length > 0) {
                    let opciones = '0. Crear nuevo tema\n';
                    for (let ti = 0; ti < temasExistentes.length; ti++) {
                        const t = temasExistentes[ti];
                        const historiasTema = await db.obtenerHistoriasPorTema(t.id);
                        opciones += (ti + 1) + '. ' + (t.icono || '📁') + ' ' + t.nombre + ' (' + historiasTema.length + ' historias)\n';
                    }
                    
                    const seleccion = await this._core?.prompt(
                        '📁 ¿A qué tema quieres asignar estas historias?\n\n' + opciones + '\nEscribe el número:',
                        '0',
                        '0-N',
                        'Asignar a tema'
                    );
                    
                    const idx = parseInt(seleccion);
                    if (isNaN(idx)) {
                        await this._core?.alert('❌ Selección inválida.', 'Error');
                        return;
                    }
                    
                    if (idx === 0) {
                        const nombre = await this._core?.prompt('📝 Nombre del nuevo tema:', data.meta.tema || 'Mi nuevo tema', '', 'Nuevo tema');
                        if (nombre) {
                            const nuevoTema = {
                                nombre: nombre,
                                descripcion: data.meta?.descripcion || '',
                                idioma: idioma,
                                nivel: nivel,
                                icono: '📁',
                                fechaCreacion: new Date().toISOString(),
                                estado: 'en_curso',
                                historiasIds: [],
                                palabrasClave: [],
                                // 🔥 GUARDAR VERSIÓN EN EL TEMA
                                _version_estandar: versionEstandar,
                                _nombre_version: nombreVersion
                            };
                            temaIdReal = await db.guardarTema(nuevoTema);
                            temaGuardado = await db.obtenerTema(temaIdReal);
                            console.log(`📂 Nuevo tema manual creado con ID: ${temaIdReal}`);
                        }
                    } else if (idx > 0 && idx <= temasExistentes.length) {
                        temaGuardado = temasExistentes[idx - 1];
                        temaIdReal = temaGuardado.id;
                        console.log(`📂 Tema seleccionado: ${temaGuardado.nombre} -> ${temaIdReal}`);
                    }
                }
                
                if (!temaGuardado) {
                    const nombre = data.meta.tema || 'Tema del generador JSON';
                    const nuevoTema = {
                        nombre: nombre,
                        descripcion: data.meta?.descripcion || 'Tema creado desde el Tutor Neuroadaptativo',
                        idioma: idioma,
                        nivel: nivel,
                        icono: '📁',
                        fechaCreacion: new Date().toISOString(),
                        estado: 'en_curso',
                        historiasIds: [],
                        palabrasClave: [],
                        _version_estandar: versionEstandar,
                        _nombre_version: nombreVersion
                    };
                    temaIdReal = await db.guardarTema(nuevoTema);
                    temaGuardado = await db.obtenerTema(temaIdReal);
                    console.log(`📂 Nuevo tema manual creado automáticamente con ID: ${temaIdReal}`);
                }
            }
            
            console.log(`📂 USANDO ID REAL DEL TEMA: ${temaIdReal} (${temaGuardado?.nombre})`);
            console.log(`📌 Versión del tema: ${temaGuardado?._nombre_version || nombreVersion}`);
            
            const duplicados = { historias: [], frases: [], palabras: [] };

            for (const historia of data.historias) {
                const existente = historiasExistentes.find(h => 
                    h.titulo && h.titulo.toLowerCase().trim() === (historia.titulo || '').toLowerCase().trim()
                );
                if (existente) {
                    duplicados.historias.push({ nueva: historia.titulo || 'Sin título', existente: existente.titulo });
                }
            }

            for (const historia of data.historias) {
                const frases = historia.frases || [];
                for (const frase of frases) {
                    if (!frase.original) continue;
                    const existente = frasesExistentes.find(f => 
                        f.original && this._calcularSimilitud(f.original, frase.original) > 0.85
                    );
                    if (existente) {
                        duplicados.frases.push({ nueva: frase.original, existente: existente.original });
                    }
                }
            }

            for (const historia of data.historias) {
                const frases = historia.frases || [];
                for (const frase of frases) {
                    const palabras = frase.palabras || [];
                    for (const palabra of palabras) {
                        const palabraText = palabra.palabra || palabra.hanzi || '';
                        if (!palabraText) continue;
                        const existente = palabrasExistentes.find(w => {
                            const wText = w.palabra || w.hanzi || '';
                            return wText.toLowerCase().trim() === palabraText.toLowerCase().trim();
                        });
                        if (existente) {
                            duplicados.palabras.push({ nueva: palabraText, existente: existente.palabra || existente.hanzi });
                        }
                    }
                }
            }

            const totalDuplicados = duplicados.historias.length + duplicados.frases.length + duplicados.palabras.length;
            
            if (totalDuplicados > 0) {
                let mensaje = '⚠️ Se detectaron ' + totalDuplicados + ' duplicados:\n\n';
                mensaje += '📚 Historias duplicadas: ' + duplicados.historias.length + '\n';
                mensaje += '📝 Frases duplicadas: ' + duplicados.frases.length + '\n';
                mensaje += '📖 Palabras duplicadas: ' + duplicados.palabras.length + '\n\n';
                mensaje += '¿Quieres continuar con la importación? (Los duplicados se omitirán)';
                
                const continuar = await this._core?.confirm(mensaje, '⚠️ Duplicados Detectados');
                if (!continuar) return;
            }

            this._core?.mostrarToast('🧠 Importando historias con reglas gramaticales y transcripción...', 'info');
            
            const importados = { historias: 0, frases: 0, palabras: 0, reglas: 0 };

            for (const historiaData of data.historias) {
                const historiaExistente = historiasExistentes.find(h => 
                    h.titulo && h.titulo.toLowerCase().trim() === (historiaData.titulo || '').toLowerCase().trim()
                );
                if (historiaExistente) continue;

                const historiaObj = {
                    titulo: historiaData.titulo || 'Historia sin título',
                    temaId: temaIdReal,
                    idioma: idioma,
                    nivel: nivel,
                    fechaCreacion: new Date().toISOString(),
                    estado: 'en_curso',
                    frases: historiaData.frases ? historiaData.frases.length : 0,
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion
                };
                
                console.log(`📝 Guardando historia con temaId: ${historiaObj.temaId} (${typeof historiaObj.temaId})`);
                
                const historiaId = await db.guardarHistoria(historiaObj);
                importados.historias++;

                const frases = historiaData.frases || [];
                for (const fraseData of frases) {
                    if (!fraseData.original || !fraseData.traduccion) continue;
                    
                    const fraseExistente = frasesExistentes.find(f => 
                        f.original && this._calcularSimilitud(f.original, fraseData.original) > 0.85
                    );
                    if (fraseExistente) continue;

                    const pinyinFrase = fraseData.pinyin || 
                                       fraseData.pinyinCompleto || 
                                       fraseData.fonetica || 
                                       fraseData.pronunciacion || 
                                       '';

                    let transcripcionFrase = '';
                    if (!esJeroglifico && fraseData.transcripcion) {
                        transcripcionFrase = fraseData.transcripcion;
                    }

                    const fraseObj = {
                        original: fraseData.original,
                        traduccion: fraseData.traduccion,
                        historiaId: historiaId,
                        esJeroglifico: esJeroglifico,
                        palabras: [],
                        rg: 0,
                        rcn: 0,
                        activa: true,
                        idioma: idioma,
                        nivel: nivel,
                        pinyinCompleto: esJeroglifico ? pinyinFrase : '',
                        transcripcion: !esJeroglifico ? transcripcionFrase : '',
                        segmentacion: esJeroglifico && fraseData.segmentacion ? {
                            hanzi: fraseData.segmentacion.hanzi || fraseData.original,
                            pinyin: fraseData.segmentacion.pinyin || pinyinFrase
                        } : null,
                        reglaGramatical: fraseData.regla_gramatical || null,
                        explicacionGramatical: fraseData.explicacion_gramatical || null,
                        tipoRegla: fraseData.tipo_regla || null,
                        _version_estandar: versionEstandar,
                        neuroData: {
                            exposiciones: 0,
                            aciertosConsecutivos: 0,
                            fallosConsecutivos: 0,
                            nivelConfianza: 0.5,
                            ultimaActivacion: Date.now(),
                            consolidacion: 0
                        }
                    };

                    for (const palabraData of (fraseData.palabras || [])) {
                        const palabraText = palabraData.palabra || palabraData.hanzi || '';
                        if (!palabraText) continue;
                        
                        const pinyinPalabra = palabraData.pinyin || 
                                             palabraData.fonetica || 
                                             palabraData.transcripcion || 
                                             '';
                        
                        let transcripcionPalabra = '';
                        if (!esJeroglifico && palabraData.transcripcion) {
                            transcripcionPalabra = palabraData.transcripcion;
                        }
                        
                        const palabraExistente = palabrasExistentes.find(w => {
                            const wText = w.palabra || w.hanzi || '';
                            return wText.toLowerCase().trim() === palabraText.toLowerCase().trim();
                        });
                        
                        let palabraObj;
                        if (!palabraExistente) {
                            const familias = Array.isArray(palabraData.familia) ? palabraData.familia : [palabraData.familia || 'sin_clasificar'];
                            const familiasLimp = familias.filter(f => f && f !== 'undefined' && f !== 'null' && f.trim() !== '');
                            
                            palabraObj = {
                                palabra: palabraText,
                                hanzi: esJeroglifico ? palabraText : '',
                                pinyin: esJeroglifico ? pinyinPalabra : '',
                                transcripcion: !esJeroglifico ? transcripcionPalabra : '',
                                familia: familiasLimp[0] || 'sin_clasificar',
                                familias: familiasLimp.length > 0 ? familiasLimp : ['sin_clasificar'],
                                tipo: palabraData.tipo || '',
                                significado: palabraData.significado || palabraText,
                                frecuencia: 1,
                                neuroScore: 0.5,
                                nivelDominio: 'nuevo',
                                idioma: idioma,
                                nivel: nivel,
                                _version_estandar: versionEstandar
                            };
                            
                            await db.guardarPalabra(palabraObj);
                            importados.palabras++;
                            palabrasExistentes.push(palabraObj);
                        } else {
                            palabraObj = palabraExistente;
                            
                            if (esJeroglifico && pinyinPalabra && !palabraObj.pinyin) {
                                palabraObj.pinyin = pinyinPalabra;
                            }
                            if (!esJeroglifico && transcripcionPalabra && !palabraObj.transcripcion) {
                                palabraObj.transcripcion = transcripcionPalabra;
                            }
                            
                            const familiasExistentes = palabraObj.familias || [];
                            const nuevaFamilia = palabraData.familia || 'sin_clasificar';
                            if (typeof nuevaFamilia === 'string' && nuevaFamilia !== 'sin_clasificar' && nuevaFamilia !== 'undefined') {
                                if (!familiasExistentes.includes(nuevaFamilia)) {
                                    familiasExistentes.push(nuevaFamilia);
                                }
                            }
                            
                            await db.guardarPalabra({
                                ...palabraObj,
                                familias: familiasExistentes,
                                pinyin: palabraObj.pinyin || pinyinPalabra,
                                transcripcion: palabraObj.transcripcion || transcripcionPalabra,
                                frecuencia: (palabraObj.frecuencia || 0) + 1,
                                _version_estandar: versionEstandar
                            });
                            
                            palabraObj.familias = familiasExistentes;
                            palabraObj.frecuencia = (palabraObj.frecuencia || 0) + 1;
                            palabraObj.pinyin = palabraObj.pinyin || pinyinPalabra;
                            palabraObj.transcripcion = palabraObj.transcripcion || transcripcionPalabra;
                        }
                        fraseObj.palabras.push(palabraObj);
                    }

                    await db.guardarFrase(fraseObj);
                    importados.frases++;
                    frasesExistentes.push(fraseObj);
                    
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
                        importados.reglas++;
                    }
                }
            }

            // ============================================================
            // IMPORTAR CARACTERES DESTACADOS (CON VERSIÓN)
            // ============================================================
            let caracteresImportados = { importados: 0, duplicados: 0, errores: 0 };
            if (data.caracteres_destacados) {
                caracteresImportados = await this._importarCaracteresDestacados(data, idioma, nivel, versionEstandar);
            }

            if (temaGuardado) {
                const historiasDelTema = await db.obtenerHistoriasPorTema(temaIdReal);
                const ids = historiasDelTema.map(h => h.id);
                temaGuardado.historiasIds = ids;
                temaGuardado.frases = (temaGuardado.frases || 0) + importados.frases;
                temaGuardado._tieneContenido = true;
                await db.update('temas', temaGuardado);
                console.log(`✅ Tema "${temaGuardado.nombre}" actualizado con ${ids.length} historias`);
                if (caracteresImportados.importados > 0) {
                    console.log(`   🀄 ${caracteresImportados.importados} caracteres raíz importados`);
                }
            }

            if (typeof gramatica !== 'undefined' && gramatica && gramatica.cargarPalabras) {
                try {
                    await gramatica.cargarPalabras();
                    if (gramatica.agrupar) await gramatica.agrupar();
                    if (gramatica._calcularNeuroCluster) await gramatica._calcularNeuroCluster();
                    if (gramatica._calcularTendencias) await gramatica._calcularTendencias();
                    console.log('✅ Gramática actualizada después de importación');
                } catch (e) {
                    console.warn('⚠️ Error actualizando gramática:', e);
                }
            }

            if (typeof pipeline !== 'undefined' && pipeline) {
                try {
                    await pipeline.cargarFrases();
                    await pipeline.cargarProgreso();
                    console.log('✅ Pipeline actualizado después de importación');
                } catch (e) {
                    console.warn('⚠️ Error actualizando pipeline:', e);
                }
            }

            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                    await window.vigiaGramatical._actualizarEdadGramatical(idioma);
                    console.log('📚 Vigía Gramatical actualizado con nuevas reglas');
                } catch (e) {
                    console.warn('⚠️ Error actualizando Vigía Gramatical:', e);
                }
            }

            this._core?.cerrarModal();
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this._core);
            if (window.UITemas) window.UITemas._renderTemas();
            if (window.UIGrammar) window.UIGrammar._cargarGramatica();
            
            if (window.UICaracteres && caracteresImportados.importados > 0) {
                setTimeout(() => {
                    window.UICaracteres.cargar(window.uiCore);
                }, 500);
            }
            
            let resumen = '✅ Importación completada:\n\n';
            resumen += '📚 Historias: ' + importados.historias + '\n';
            resumen += '📝 Frases: ' + importados.frases + '\n';
            resumen += '📖 Palabras: ' + importados.palabras + '\n';
            resumen += '📋 Reglas gramaticales: ' + importados.reglas + '\n';
            if (caracteresImportados.importados > 0) {
                resumen += '🀄 Caracteres raíz: ' + caracteresImportados.importados + ' (nuevos)\n';
                resumen += '🀄 Caracteres duplicados: ' + caracteresImportados.duplicados + '\n';
            }
            if (temaGuardado) {
                resumen += '\n📂 Tema: ' + temaGuardado.nombre + ' (ID: ' + temaGuardado.id + ')';
                const esPredefinido = temaGuardado._esPredefinido === true;
                const esImportado = temaGuardado._esImportado === true || temaGuardado.origen === 'importado';
                if (esPredefinido) {
                    resumen += '\n📍 Ubicación: Temas Predefinidos por Nivel';
                } else if (esImportado) {
                    resumen += '\n📍 Ubicación: Temas Importados';
                } else {
                    resumen += '\n📍 Ubicación: Mis Temas (tema manual)';
                }
                if (temaGuardado._nombre_version) {
                    resumen += `\n📌 Versión: ${temaGuardado._nombre_version}`;
                }
            }
            if (totalDuplicados > 0) {
                resumen += '\n\n⏭️ Duplicados omitidos: ' + totalDuplicados;
            }
            
            if (esJeroglifico) {
                resumen += '\n\n🔊 ¡Pinyin incluido para idioma jeroglífico!';
                if (caracteresImportados.importados > 0) {
                    resumen += '\n🀄 ¡Caracteres disponibles en el Módulo de Caracteres!';
                }
            } else {
                const idiomaNativoNombre = this._getNombreIdioma(this._idiomaNativo);
                resumen += `\n\n🎤 ¡Transcripción fonética incluida en ${idiomaNativoNombre}!`;
                resumen += '\n🎤 ¡Disponible en el Módulo de Fonética!';
            }
            
            await this._core?.alert(resumen, '📊 Resumen');

        } catch (error) {
            await this._core?.alert('❌ Error en la importación:\n' + error.message + '\n\nVerifica que el JSON sea válido.', 'Error');
            console.error('❌ Error importando JSON:', error);
        }
    }

    // ============================================================
    // IMPORTAR CARACTERES DESTACADOS (CON VERSIÓN)
    // ============================================================

    async _importarCaracteresDestacados(data, idioma, nivel, versionEstandar) {
        if (!data.caracteres_destacados || !data.caracteres_destacados.lista) {
            console.log('ℹ️ No hay caracteres destacados en el JSON');
            return { importados: 0, errores: 0, duplicados: 0 };
        }

        console.log('🀄 Importando caracteres destacados...');
        const lista = data.caracteres_destacados.lista || [];
        
        let importados = 0;
        let duplicados = 0;
        let errores = 0;

        for (const item of lista) {
            try {
                const caracter = item.caracter;
                const pinyin = item.pinyin || '';
                const significado = item.significado || '';
                const frecuencia = item.frecuencia || 1;
                const trazos = item.trazos || 0;
                const radical = item.radical || '';
                const palabrasRelacionadas = item.palabras_relacionadas || [];
                const frasesDeLaHistoria = item.frases_de_la_historia || [];
                const nivelSugerido = item.nivel_sugerido || nivel || 'A1';
                const familiaSemantica = item.familia_semantica || 'Caracteres Raíz';
                const etimologia = item.etimologia || '';
                const mnemotecnia = item.mnemotecnia || '';

                const caracteresExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                const existente = caracteresExistentes.find(p => 
                    (p.palabra || p.hanzi || '') === caracter && 
                    p.esCaracterRaiz === true
                );

                if (existente) {
                    console.log(`⏭️ Carácter raíz "${caracter}" ya existe`);
                    duplicados++;
                    continue;
                }

                const raizObj = {
                    palabra: caracter,
                    hanzi: caracter,
                    pinyin: pinyin,
                    significado: significado || caracter,
                    familia: 'caracter_raiz',
                    familias: ['caracter_raiz'],
                    familiaSemantica: familiaSemantica,
                    nivel: nivelSugerido,
                    tipo: 'caracter_raiz',
                    idioma: idioma,
                    frecuencia: frecuencia,
                    neuroScore: 0.5,
                    nivelDominio: 'nuevo',
                    fechaCreacion: Date.now(),
                    esCaracterRaiz: true,
                    tema: data.meta?.tema || 'General',
                    numero_trazos: trazos,
                    estructura: {
                        trazos_clave: [],
                        radicales: radical ? [radical] : [],
                        tipo_estructura: this._detectarTipoEstructura(caracter)
                    },
                    etimologia_breve: etimologia || '',
                    mnemotecnia: mnemotecnia || `🧠 ${caracter} significa "${significado}"`,
                    variantes: null,
                    esPalabraDerivada: false,
                    caracterRaiz: null,
                    desgloseMorfologico: '',
                    desgloseCaracteres: [],
                    asociacionVisual: '',
                    ejemploFrase: frasesDeLaHistoria.length > 0 ? frasesDeLaHistoria[0] : '',
                    familiaSemanticaPrincipal: familiaSemantica,
                    temaFamilia: data.meta?.tema || 'General',
                    _version_estandar: versionEstandar
                };

                const idRaiz = await db.guardarPalabra(raizObj);
                
                if (idRaiz) {
                    importados++;
                    console.log(`✅ Carácter raíz "${caracter}" guardado (ID: ${idRaiz})`);

                    for (const palabraRel of palabrasRelacionadas) {
                        const derivadaExistente = caracteresExistentes.find(p => 
                            (p.palabra || p.hanzi || '') === palabraRel && 
                            p.esPalabraDerivada === true &&
                            p.caracterRaiz === caracter
                        );

                        if (derivadaExistente) {
                            continue;
                        }

                        let pinyinDerivada = '';
                        let significadoDerivada = '';
                        if (item.palabras_relacionadas_info) {
                            const info = item.palabras_relacionadas_info.find(p => p.palabra === palabraRel);
                            if (info) {
                                pinyinDerivada = info.pinyin || '';
                                significadoDerivada = info.significado || '';
                            }
                        }

                        const derivadaObj = {
                            palabra: palabraRel,
                            hanzi: palabraRel,
                            pinyin: pinyinDerivada,
                            significado: significadoDerivada || `Relacionado con ${caracter}`,
                            familia: 'derivada',
                            familias: ['derivada'],
                            familiaSemantica: familiaSemantica,
                            nivel: nivelSugerido,
                            tipo: 'sustantivo',
                            idioma: idioma,
                            frecuencia: 1,
                            neuroScore: 0.5,
                            nivelDominio: 'nuevo',
                            fechaCreacion: Date.now(),
                            esPalabraDerivada: true,
                            caracterRaiz: caracter,
                            desgloseMorfologico: `Compuesto de "${caracter}" + "${palabraRel}"`,
                            desgloseCaracteres: [
                                { caracter: caracter, pinyin: pinyin, significado: significado },
                                { caracter: palabraRel, pinyin: pinyinDerivada, significado: significadoDerivada }
                            ],
                            asociacionVisual: `🔗 ${palabraRel} está relacionado con ${caracter}`,
                            ejemploFrase: frasesDeLaHistoria.length > 0 ? frasesDeLaHistoria[0] : '',
                            familiaSemanticaPrincipal: familiaSemantica,
                            temaFamilia: data.meta?.tema || 'General',
                            _version_estandar: versionEstandar
                        };

                        try {
                            const idDerivada = await db.guardarPalabra(derivadaObj);
                            if (idDerivada) {
                                console.log(`  ✅ Palabra derivada "${palabraRel}" guardada`);
                            }
                        } catch (e) {
                            console.warn(`⚠️ Error guardando palabra derivada "${palabraRel}":`, e);
                        }
                    }

                    const nombreNivel = `📚 Nivel ${nivelSugerido}`;
                    const nombreFamilia = `🧠 ${familiaSemantica}`;

                    if (window.gestorFavoritos) {
                        try {
                            await window.gestorFavoritos.añadirPalabra(idRaiz);
                            await window.gestorFavoritos.añadirPalabraAGrupo(idRaiz, nombreNivel);
                            await window.gestorFavoritos.añadirPalabraAGrupo(idRaiz, nombreFamilia);
                            await window.gestorFavoritos.añadirPalabraAGrupo(idRaiz, `📂 ${familiaSemantica}`);
                        } catch (e) {
                            console.warn(`⚠️ Error guardando en Mi Espacio:`, e);
                        }
                    }

                } else {
                    errores++;
                    console.warn(`⚠️ Error guardando carácter raíz "${caracter}"`);
                }

            } catch (e) {
                console.warn(`⚠️ Error procesando carácter:`, e);
                errores++;
            }
        }

        console.log(`✅ Caracteres importados: ${importados}, duplicados: ${duplicados}, errores: ${errores}`);
        return { importados, duplicados, errores };
    }

    _detectarTipoEstructura(caracter) {
        if (!caracter) return 'desconocido';
        if (/[明好林双从]/u.test(caracter)) return 'izquierda-derecha';
        if (/[安花草苗]/u.test(caracter)) return 'arriba-abajo';
        if (/[国园图园]/u.test(caracter)) return 'envolvente';
        if (/[街微微]/u.test(caracter)) return 'izquierda-media-derecha';
        if (/[草篮]/u.test(caracter)) return 'arriba-media-abajo';
        return 'simple';
    }

    // ============================================================
    // IMPORTAR FAMILIA DE CARACTERES (CON VERSIÓN)
    // ============================================================

    async _importarFamiliaCaracteres(data) {
        console.log('🀄 Importando Familia de Caracteres:', data.meta?.tema);

        let caracterRaiz = data.caracter_raiz;
        let palabrasFamilia = data.familia_palabras || [];
        let meta = data.meta || {};

        if (!caracterRaiz && data._INSTRUCCIONES_PARA_IA && data.caracter_raiz) {
            caracterRaiz = data.caracter_raiz;
            palabrasFamilia = data.familia_palabras || [];
            meta = data.meta || {};
        }

        if (!meta.caracter_raiz && caracterRaiz && caracterRaiz.simbolo) {
            meta.caracter_raiz = caracterRaiz.simbolo;
        }

        const idioma = meta.idioma || data.idioma || this._idiomaActual || 'zh';
        const nivel = meta.nivel || data.nivel || this._nivelActual || 'A1';
        
        // 🔥 OBTENER VERSIÓN
        const versionEstandar = meta.version_estandar || this._obtenerVersionEstandar(idioma);
        const nombreVersion = meta.nombre_version || this._obtenerNombreVersion(idioma, versionEstandar);

        if (!caracterRaiz || !caracterRaiz.simbolo) {
            throw new Error('La familia de caracteres está incompleta. Falta el carácter raíz.');
        }

        if (palabrasFamilia.length === 0) {
            throw new Error('No hay palabras derivadas en el JSON.');
        }

        this._core?.mostrarToast(`🀄 Tutor Neuroadaptativo: Importando familia "${caracterRaiz.simbolo}" (${palabrasFamilia.length} palabras) con ${nombreVersion}...`, 'info');

        let importados = 0;
        let duplicados = 0;
        let errores = 0;

        const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
        const caracterExistente = palabrasExistentes.find(p => 
            (p.palabra || p.hanzi || '') === caracterRaiz.simbolo
        );

        if (!caracterExistente) {
            const palabraRaiz = {
                palabra: caracterRaiz.simbolo,
                hanzi: caracterRaiz.simbolo,
                pinyin: caracterRaiz.pinyin || '',
                significado: caracterRaiz.significado_base || caracterRaiz.simbolo,
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
                numero_trazos: caracterRaiz.numero_trazos || 0,
                estructura: caracterRaiz.estructura || null,
                etimologia_breve: caracterRaiz.etimologia_breve || '',
                mnemotecnia: caracterRaiz.mnemotecnia || '',
                variantes: caracterRaiz.variantes || null,
                esCaracterRaiz: true,
                tema: meta.tema || 'General',
                _version_estandar: versionEstandar,
                _nombre_version: nombreVersion
            };
            await db.guardarPalabra(palabraRaiz);
            importados++;
            console.log(`✅ Carácter raíz "${caracterRaiz.simbolo}" guardado con ${nombreVersion}`);
        } else {
            duplicados++;
            console.log(`⏭️ Carácter raíz "${caracterRaiz.simbolo}" ya existe`);
        }

        const nombreFamilia = `🧠 ${meta.tema || 'Familia'}`;
        const nombreNivel = `📚 Nivel ${nivel}`;

        for (const p of palabrasFamilia) {
            try {
                const palabraText = p.palabra || '';
                if (!palabraText || palabraText === caracterRaiz.simbolo) continue;

                const palabraExistente = palabrasExistentes.find(w => 
                    (w.palabra || w.hanzi || '') === palabraText
                );

                let palabraId;
                if (palabraExistente) {
                    palabraId = palabraExistente.id;
                    duplicados++;
                    console.log(`⏭️ Palabra "${palabraText}" ya existe`);
                    
                    await db.guardarPalabra({
                        ...palabraExistente,
                        frecuencia: (palabraExistente.frecuencia || 0) + 1,
                        _version_estandar: versionEstandar,
                        _nombre_version: nombreVersion
                    });
                } else {
                    const nuevaPalabra = {
                        palabra: palabraText,
                        hanzi: palabraText,
                        pinyin: p.pinyin || '',
                        significado: p.significado || palabraText,
                        familia: p.familia_semantica || 'general',
                        familias: [p.familia_semantica || 'general'],
                        familiaSemantica: p.familia_semantica || 'general',
                        nivel: p.nivel_sugerido || nivel,
                        tipo: 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esPalabraDerivada: true,
                        caracterRaiz: caracterRaiz.simbolo,
                        desgloseMorfologico: p.desglose_morfologico || '',
                        desgloseCaracteres: p.desglose_caracteres || [],
                        asociacionVisual: p.asociacion_visual || '',
                        ejemploFrase: p.ejemplo_frase || '',
                        traduccionFrase: p.traduccion_frase || '',
                        familiaSemanticaPrincipal: p.familia_semantica || 'general',
                        temaFamilia: meta.tema || 'General',
                        _version_estandar: versionEstandar,
                        _nombre_version: nombreVersion
                    };
                    palabraId = await db.guardarPalabra(nuevaPalabra);
                    importados++;
                    console.log(`✅ Palabra "${palabraText}" guardada con ${nombreVersion}`);
                }

                if (palabraId) {
                    await window.gestorFavoritos.añadirPalabra(palabraId);
                    await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreNivel);
                    await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreFamilia);
                    await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, `📂 ${p.familia_semantica || 'General'}`);
                }

            } catch (e) {
                console.warn(`⚠️ Error guardando palabra "${p.palabra}":`, e);
                errores++;
            }
        }

        if (window.gramatica) {
            await gramatica.cargarPalabras();
            await gramatica.agrupar();
        }

        if (window.pipeline) {
            await pipeline.cargarFrases();
            await pipeline.cargarProgreso();
        }

        if (window.vigiaGramatical) {
            try {
                await window.vigiaGramatical.initGramatical();
                await window.vigiaGramatical._actualizarEdadGramatical(idioma);
            } catch (e) {}
        }

        this._core?.cerrarModal();
        
        let resumen = '✅ **Familia de Caracteres Importada**\n\n';
        resumen += `📌 Carácter raíz: **${caracterRaiz.simbolo}** (${caracterRaiz.significado_base || 'Sin significado'})\n`;
        resumen += `📚 Tema: ${meta.tema || 'General'}\n`;
        resumen += `🎯 Nivel: ${nivel}\n`;
        resumen += `📌 Versión: ${nombreVersion}\n\n`;
        resumen += `📝 Palabras importadas: ${importados}\n`;
        resumen += `⏭️ Palabras duplicadas: ${duplicados}\n`;
        resumen += `❌ Errores: ${errores}\n\n`;

        if (importados > 0) {
            resumen += `📂 **Guardado en Mi Espacio:**\n`;
            resumen += `   • ${nombreNivel}\n`;
            resumen += `   • ${nombreFamilia}\n`;
            resumen += `   • 📂 ${palabrasFamilia[0]?.familia_semantica || 'General'}\n\n`;
            resumen += `💡 Puedes verlas en "Mi Espacio" o estudiar desde "Gramática".`;

            await this._core?.alert(resumen, '✅ Importación Completada');
            
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this._core);
            if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
            if (window.UIGrammar) window.UIGrammar._cargarGramatica();
            if (window.UIConfig) window.UIConfig._recargarConfiguracion();
            if (window.UICaracteres) {
                setTimeout(() => {
                    window.UICaracteres.cargar(window.uiCore);
                }, 300);
            }
            
        } else {
            await this._core?.alert(resumen, 'ℹ️ Importación Parcial');
        }
    }

    _calcularSimilitud(a, b) {
        if (!a || !b) return 0;
        const palabrasA = new Set(a.toLowerCase().split(''));
        const palabrasB = new Set(b.toLowerCase().split(''));
        const interseccion = new Set([...palabrasA].filter(x => palabrasB.has(x)));
        return interseccion.size / Math.max(palabrasA.size, palabrasB.size);
    }
}

window.UIJSON = new UIJSON();

console.log('✅ UIJSON v22.0 - CON SOPORTE PARA VERSIONES DE ESTÁNDAR');
console.log('  📌 HSK 3.0 soportado con 500 palabras para A1');
console.log('  📊 Palabras requeridas visibles en la generación');
console.log('  🔄 Temas recomendados según la versión');
console.log('  🎯 Número de historias sugerido automáticamente');