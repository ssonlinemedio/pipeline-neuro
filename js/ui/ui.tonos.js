// ============================================================
// UI ESTUDIO DE TONOS v17.6 - PROMPT POR NIVEL
// ============================================================

class UITonos {
    constructor() {
        // ============================================================
        // ESTADO PRINCIPAL
        // ============================================================
        this._core = null;
        this._container = null;
        this._initDone = false;
        this._idiomaActual = null;
        this._nivelUsuario = 'A1';
        
        // ============================================================
        // GRUPO DE SÍLABAS ACTIVO
        // ============================================================
        this._grupoActual = null;
        this._grupoData = null;
        this._historiasGrupo = [];
        this._historiasGuardadas = {};
        this._historiasLeidas = new Set();
        this._historiaEnEstudio = null;
        this._historiaActual = null;
        this._visorAbierto = false;
        this._visorOcultarTraduccion = false;
        
        // ============================================================
        // DICCIONARIO TONAL
        // ============================================================
        this._diccionario = {};
        this._diccionarioCargado = false;
        this._generandoDiccionario = false;
        this._progresoGeneracion = 0;
        this._primeraCarga = true;
        
        // ============================================================
        // PERSISTENCIA
        // ============================================================
        this._todasLasHistorias = {};
        this._persistenciaKey = 'pipeline_tonos_v17';
        
        // ============================================================
        // NAVEGACIÓN
        // ============================================================
        this._modoVista = 'panel';
        this._estudiandoHistoria = false;
        this._botonInyectado = false;
        
        // ============================================================
        // UI - PAGINACIÓN
        // ============================================================
        this._paginaActual = 1;
        this._itemsPorPagina = 8;
        this._paginaHistorias = 1;
        this._historiasPorPagina = 3;
        this._busqueda = '';
        this._generando = false;
        this._importando = false;
        this._cargando = false;
        this._modalAbierto = false;
        this._mostrandoModalBienvenida = false;
        
        // ============================================================
        // COLORES DE TONOS - PARA IDENTIFICAR MEJOR
        // ============================================================
        this.TONOS_COLORES = {
            'mā': '#6C5CE7',    // 1er tono - Púrpura
            'má': '#00B894',    // 2º tono - Verde
            'mǎ': '#FDCB6E',    // 3er tono - Amarillo
            'mà': '#E17055',    // 4º tono - Rojo
            'ma': '#636E72'     // Neutro - Gris
        };
        
        this.TONOS_DESCRIPCION = {
            'mā': '1er tono (alto y nivel)',
            'má': '2º tono (ascendente)',
            'mǎ': '3er tono (descendente-ascendente)',
            'mà': '4º tono (descendente)',
            'ma': 'Tono neutro'
        };
        
        // ============================================================
        // IDIOMAS TONALES SOPORTADOS
        // ============================================================
        this._IDIOMAS_TONALES = ['zh', 'chino', 'chinese', 'mandarin', 'mandarín', 
                                 'th', 'tailandés', 'thai', 'vi', 'vietnamita', 'vietnamese'];
        
        // ============================================================
        // INICIALIZACIÓN - SIN MODAL AUTOMÁTICO
        // ============================================================
        this._idiomaActual = this._obtenerIdiomaActual();
        this._nivelUsuario = this._obtenerNivelRealUsuario();
        
        this._cargarDiccionario();
        this._cargarEstadoCompleto();
        this._configurarListeners();
        this._configurarGuardadoAutomatico();
        
        console.log('🎵 UI Tonos v17.6 - PROMPT POR NIVEL');
        console.log(`   📚 ${Object.keys(this._diccionario).length} sílabas disponibles`);
        console.log(`   🎯 Nivel usuario: ${this._nivelUsuario}`);
        console.log(`   🌍 Idioma: ${this._idiomaActual}`);
        console.log('   🎨 Colores por tono: ✅ (grilla, grupo, visor)');
        console.log('   📄 Paginación de historias: ✅ (3 por página)');
        console.log('   🔄 Generación continua: ✅ (8-10 líneas)');
        console.log('   🔥 Modal SOLO dentro del módulo Tonos');
        console.log('   📌 PROMPT MODIFICADO: solicita SOLO sílabas del nivel del usuario');
    }

    // ============================================================
    // OBTENER CORE
    // ============================================================

    _obtenerCore() {
        if (this._core) return this._core;
        if (window.uiCore) {
            this._core = window.uiCore;
            return this._core;
        }
        return null;
    }

    // ============================================================
    // OBTENER COLOR DE UN TONO - PÚBLICO PARA RENDERIZADO
    // ============================================================

    _getColorTono(tono) {
        return this.TONOS_COLORES[tono] || '#636E72';
    }

    // ============================================================
    // DICCIONARIO - GESTOR
    // ============================================================

    _cargarDiccionario() {
        try {
            const key = `pipeline_diccionario_tonal_${this._idiomaActual}`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const data = JSON.parse(stored);
                if (data.diccionario && Object.keys(data.diccionario).length > 0) {
                    this._diccionario = data.diccionario;
                    this._diccionarioCargado = true;
                    this._primeraCarga = false;
                    console.log(`📖 Diccionario cargado: ${Object.keys(data.diccionario).length} sílabas`);
                    return;
                }
            }
            
            if (db && db._initialized) {
                db.getByIndex('configuracion', 'clave', key).then(configs => {
                    if (configs && configs.length > 0 && configs[0].valor) {
                        try {
                            const data = JSON.parse(configs[0].valor);
                            if (data.diccionario && Object.keys(data.diccionario).length > 0) {
                                this._diccionario = data.diccionario;
                                this._diccionarioCargado = true;
                                this._primeraCarga = false;
                                localStorage.setItem(key, JSON.stringify({
                                    version: '17.6',
                                    timestamp: Date.now(),
                                    idioma: this._idiomaActual,
                                    diccionario: data.diccionario
                                }));
                                if (this._container && this._container.offsetParent !== null) {
                                    this._renderizarPanel();
                                }
                            }
                        } catch (e) {}
                    }
                }).catch(() => {});
            }
            
            if (Object.keys(this._diccionario).length === 0) {
                this._diccionario = {};
                this._diccionarioCargado = false;
                this._primeraCarga = true;
            }
            
        } catch (e) {
            console.warn('⚠️ Error cargando diccionario:', e);
            this._diccionario = {};
            this._diccionarioCargado = false;
            this._primeraCarga = true;
        }
    }

    _guardarDiccionario() {
        try {
            const key = `pipeline_diccionario_tonal_${this._idiomaActual}`;
            localStorage.setItem(key, JSON.stringify({
                version: '17.6',
                timestamp: Date.now(),
                idioma: this._idiomaActual,
                diccionario: this._diccionario
            }));
            
            if (db && db._initialized) {
                db.getByIndex('configuracion', 'clave', key).then(configs => {
                    if (configs && configs.length > 0) {
                        db.update('configuracion', {
                            ...configs[0],
                            valor: JSON.stringify({
                                version: '17.6',
                                timestamp: Date.now(),
                                idioma: this._idiomaActual,
                                diccionario: this._diccionario
                            }),
                            timestamp: Date.now()
                        });
                    } else {
                        db.add('configuracion', {
                            clave: key,
                            valor: JSON.stringify({
                                version: '17.6',
                                timestamp: Date.now(),
                                idioma: this._idiomaActual,
                                diccionario: this._diccionario
                            }),
                            timestamp: Date.now()
                        });
                    }
                }).catch(() => {});
            }
            
            console.log(`💾 Diccionario guardado: ${Object.keys(this._diccionario).length} sílabas`);
        } catch (e) {
            console.warn('⚠️ Error guardando diccionario:', e);
        }
    }

    // ============================================================
    // 📌 PROMPT PARA DICCIONARIO - MODIFICADO: POR NIVEL
    // ============================================================

    _generarPromptDiccionario() {
        const idioma = this._idiomaActual;
        const nombreIdioma = this._getNombreIdioma(idioma);
        const nivel = this._nivelUsuario;
        const idiomaNativo = this._obtenerIdiomaNativo();

        return `Eres un experto lingüista especializado en el idioma ${nombreIdioma} (${idioma}).

Tu tarea es generar un DICCIONARIO TONAL para el idioma ${nombreIdioma}.

**INFORMACIÓN:**
- Idioma: ${idioma} (${nombreIdioma})
- Nivel del usuario: ${nivel} (MCER)
- Idioma nativo del usuario: ${idiomaNativo}

**INSTRUCCIONES:**

1. Genera SOLO las sílabas del idioma ${nombreIdioma} que corresponden al nivel ${nivel}.
2. Para CADA sílaba, indica TODOS los tonos que existen en el idioma.
3. Los tonos estándar son: 1er tono (mā), 2º tono (má), 3er tono (mǎ), 4º tono (mà), tono neutro (ma).
4. Para CADA tono que existe, proporciona:
   - "caracter": El carácter que corresponde a ese tono
   - "significado": Su significado en ${idiomaNativo}
   - "nivel": ${nivel} (TODOS los tonos deben ser de este nivel)
   - "ejemplos": Array de 2-3 ejemplos de uso con pinyin y traducción
   - "palabras": Array de palabras compuestas que usan este carácter

5. SOLO incluye tonos que REALMENTE existen en el idioma.
6. NO inventes caracteres que no existen.
7. TODOS los elementos generados deben ser de nivel ${nivel}.
8. Los ejemplos deben ser frases cotidianas y útiles para el nivel ${nivel}.
9. Selecciona un conjunto REPRESENTATIVO del vocabulario del nivel ${nivel}.
10. Incluye entre 20 y 50 sílabas (no más de 50 para evitar respuestas demasiado largas).

**FORMATO DE RESPUESTA (JSON):**
{
  "silaba1": {
    "silaba": "silaba1",
    "tonos": {
      "mā": {
        "caracter": "carácter",
        "significado": "significado en ${idiomaNativo}",
        "nivel": "${nivel}",
        "ejemplos": ["ejemplo1 con pinyin - traducción", "ejemplo2 con pinyin - traducción"],
        "palabras": ["palabra1", "palabra2"]
      },
      "má": { ... },
      ...
    }
  },
  "silaba2": { ... },
  ...
}

**RESPONDE SOLO CON EL JSON VÁLIDO, SIN TEXTO ADICIONAL.**

Ahora genera el diccionario tonal para ${nombreIdioma} nivel ${nivel}.`;
    }

    // ============================================================
    // 📌 PROMPT PARA HISTORIA - 8 A 10 LÍNEAS CON CONTINUIDAD
    // ============================================================

    _generarPromptHistoria(grupo, data, historiaAnterior = null) {
        const idioma = this._idiomaActual;
        const nombreIdioma = this._getNombreIdioma(idioma);
        const nivel = this._nivelUsuario;
        const idiomaNativo = this._obtenerIdiomaNativo();
        
        const tonosKeys = Object.keys(data.tonos);
        
        // 🔥 DESCRIPCIÓN DE CADA TONO CON COLOR (para el prompt)
        const descripcionTonos = tonosKeys.map(function(t) {
            const info = data.tonos[t];
            return `- ${t}: ${info.caracter} (${info.significado}) - Nivel ${info.nivel}`;
        }.bind(this)).join('\n');
        
        const tonosList = tonosKeys.map(function(t) {
            return `"${t}"`;
        }).join(', ');
        
        // 🔥 EJEMPLO DE 8 LÍNEAS CON LOS TONOS REALES
        const ejemplosLineas = [];
        const tonosCiclicos = [...tonosKeys];
        // Asegurar que todos los tonos aparezcan al menos una vez
        const lineasNecesarias = Math.max(8, tonosKeys.length);
        for (let idx = 0; idx < lineasNecesarias; idx++) {
            const t = tonosCiclicos[idx % tonosCiclicos.length];
            const info = data.tonos[t];
            ejemplosLineas.push(`    {
      "numero": ${idx + 1},
      "hanzi": "Frase en ${idioma} con el tono ${t} (${info.caracter})",
      "pinyin": "pinyin completo con tonos para ${t}",
      "traduccion": "Traducción al ${idiomaNativo}",
      "tono_usado": "${t}"
    }`);
        }
        const ejemplosStr = ejemplosLineas.join(',\n');
        
        // 🔥 CONTEXTO DE LA HISTORIA ANTERIOR PARA GENERACIÓN CONTINUA
        let contextoContinuo = '';
        if (historiaAnterior) {
            const frasesAnteriores = historiaAnterior.frases || [];
            const resumenAnterior = frasesAnteriores.slice(0, 3).map(f => f.hanzi || f.original || '').join(' ');
            const tituloAnterior = historiaAnterior.titulo || 'Historia anterior';
            const ultimaFrase = frasesAnteriores.length > 0 ? frasesAnteriores[frasesAnteriores.length - 1] : null;
            const ultimoTexto = ultimaFrase ? (ultimaFrase.hanzi || ultimaFrase.original || '') : '';
            
            contextoContinuo = `
**CONTEXTO DE LA HISTORIA ANTERIOR:**
- Título: "${tituloAnterior}"
- Última frase: "${ultimoTexto}"
- Resumen: ${resumenAnterior}

**INSTRUCCIÓN DE CONTINUIDAD:**
La nueva historia debe CONTINUAR la historia anterior. 
- Mantén los MISMOS personajes, lugar o contexto.
- La historia anterior terminó con: "${ultimoTexto}"
- La nueva historia debe desarrollar lo que pasó DESPUÉS de ese momento.
- Crea una conexión natural entre ambas historias (como capítulos de una misma historia).
- NO repitas la historia anterior, continúa la trama.`;
        }
        
        return `Eres un escritor creativo y experto en el idioma ${nombreIdioma} (${idioma}).

Tu tarea es escribir una historia corta que use TODOS los tonos de la sílaba "${grupo}".

**INFORMACIÓN:**
- Sílaba: ${grupo}
- Idioma: ${idioma} (${nombreIdioma})
- Nivel del usuario: ${nivel}
- Idioma nativo del usuario: ${idiomaNativo}
${contextoContinuo}

**TONOS DE LA SÍLABA "${grupo}" (DEBES USARLOS TODOS):**
${descripcionTonos}

**REGLAS IMPORTANTES:**

1. Escribe una historia de **8 a 10 líneas** en ${idioma}.
2. La historia DEBE usar TODOS los tonos de la sílaba "${grupo}" al menos una vez (${tonosList}).
3. Cada línea debe incluir:
   - "hanzi": La frase en ${idioma}
   - "pinyin": La pronunciación COMPLETA con tonos
   - "traduccion": Traducción al ${idiomaNativo}
   - "tono_usado": El tono que se usa en esa línea (${tonosList})

4. La historia debe ser COHERENTE y NATURAL.
5. El título debe ser DESCRIPTIVO y CREATIVO.
6. Las frases deben ser cotidianas y útiles para el nivel ${nivel}.
7. **IMPORTANTE:** La historia debe tener entre 8 y 10 líneas. No menos de 8, no más de 10.
${historiaAnterior ? '8. CONTINÚA la historia anterior. No la repitas, continúa la trama desde donde terminó.' : ''}

**FORMATO DE RESPUESTA (JSON):**
{
  "titulo": "Título creativo de la historia",
  "lineas": [
${ejemplosStr}
  ]
}

**RESPONDE SOLO CON EL JSON VÁLIDO, SIN TEXTO ADICIONAL.**

Ahora genera una historia para la sílaba "${grupo}" en ${nombreIdioma} que use TODOS sus tonos: ${tonosList}${historiaAnterior ? ' y CONTINÚE la historia anterior.' : '.'}`;
    }

    // ============================================================
    // OBTENER TODAS LAS SÍLABAS DEL IDIOMA
    // ============================================================

    _obtenerTodasLasSilabas(idioma) {
        const SILABAS_CHINO = [
            'a', 'ai', 'an', 'ang', 'ao',
            'ba', 'bai', 'ban', 'bang', 'bao', 'bei', 'ben', 'beng', 'bi', 'bian',
            'biao', 'bie', 'bin', 'bing', 'bo', 'bu',
            'ca', 'cai', 'can', 'cang', 'cao', 'ce', 'cen', 'ceng', 'cha', 'chai',
            'chan', 'chang', 'chao', 'che', 'chen', 'cheng', 'chi', 'chong', 'chou',
            'chu', 'chua', 'chuai', 'chuan', 'chuang', 'chui', 'chun', 'chuo', 'ci',
            'cong', 'cou', 'cu', 'cuan', 'cui', 'cun', 'cuo',
            'da', 'dai', 'dan', 'dang', 'dao', 'de', 'dei', 'den', 'deng', 'di',
            'dian', 'diao', 'die', 'ding', 'diu', 'dong', 'dou', 'du', 'duan',
            'dui', 'dun', 'duo',
            'e', 'ei', 'en', 'eng', 'er',
            'fa', 'fan', 'fang', 'fei', 'fen', 'feng', 'fo', 'fou', 'fu',
            'ga', 'gai', 'gan', 'gang', 'gao', 'ge', 'gei', 'gen', 'geng', 'gong',
            'gou', 'gu', 'gua', 'guai', 'guan', 'guang', 'gui', 'gun', 'guo',
            'ha', 'hai', 'han', 'hang', 'hao', 'he', 'hei', 'hen', 'heng', 'hong',
            'hou', 'hu', 'hua', 'huai', 'huan', 'huang', 'hui', 'hun', 'huo',
            'ji', 'jia', 'jian', 'jiang', 'jiao', 'jie', 'jin', 'jing', 'jiong',
            'jiu', 'ju', 'juan', 'jue', 'jun',
            'ka', 'kai', 'kan', 'kang', 'kao', 'ke', 'kei', 'ken', 'keng', 'kong',
            'kou', 'ku', 'kua', 'kuai', 'kuan', 'kuang', 'kui', 'kun', 'kuo',
            'la', 'lai', 'lan', 'lang', 'lao', 'le', 'lei', 'leng', 'li', 'lia',
            'lian', 'liang', 'liao', 'lie', 'lin', 'ling', 'liu', 'lo', 'long',
            'lou', 'lu', 'luan', 'lun', 'luo', 'lv', 'lve',
            'ma', 'mai', 'man', 'mang', 'mao', 'me', 'mei', 'men', 'meng', 'mi',
            'mian', 'miao', 'mie', 'min', 'ming', 'miu', 'mo', 'mou', 'mu',
            'na', 'nai', 'nan', 'nang', 'nao', 'ne', 'nei', 'nen', 'neng', 'ni',
            'nian', 'niang', 'niao', 'nie', 'nin', 'ning', 'niu', 'nong', 'nou',
            'nu', 'nuan', 'nuo', 'nv', 'nve',
            'o', 'ou',
            'pa', 'pai', 'pan', 'pang', 'pao', 'pei', 'pen', 'peng', 'pi', 'pian',
            'piao', 'pie', 'pin', 'ping', 'po', 'pou', 'pu',
            'qi', 'qia', 'qian', 'qiang', 'qiao', 'qie', 'qin', 'qing', 'qiong',
            'qiu', 'qu', 'quan', 'que', 'qun',
            'ran', 'rang', 'rao', 're', 'ren', 'reng', 'ri', 'rong', 'rou', 'ru',
            'ruan', 'rui', 'run', 'ruo',
            'sa', 'sai', 'san', 'sang', 'sao', 'se', 'sen', 'seng', 'sha', 'shai',
            'shan', 'shang', 'shao', 'she', 'shei', 'shen', 'sheng', 'shi',
            'shou', 'shu', 'shua', 'shuai', 'shuan', 'shuang', 'shui', 'shun',
            'shuo', 'si', 'song', 'sou', 'su', 'suan', 'sui', 'sun', 'suo',
            'ta', 'tai', 'tan', 'tang', 'tao', 'te', 'teng', 'ti', 'tian',
            'tiao', 'tie', 'ting', 'tong', 'tou', 'tu', 'tuan', 'tui', 'tun',
            'tuo',
            'wa', 'wai', 'wan', 'wang', 'wei', 'wen', 'weng', 'wo', 'wu',
            'xi', 'xia', 'xian', 'xiang', 'xiao', 'xie', 'xin', 'xing', 'xiong',
            'xiu', 'xu', 'xuan', 'xue', 'xun',
            'ya', 'yan', 'yang', 'yao', 'ye', 'yi', 'yin', 'ying', 'yo', 'yong',
            'you', 'yu', 'yuan', 'yue', 'yun',
            'za', 'zai', 'zan', 'zang', 'zao', 'ze', 'zei', 'zen', 'zeng', 'zha',
            'zhai', 'zhan', 'zhang', 'zhao', 'zhe', 'zhei', 'zhen', 'zheng',
            'zhi', 'zhong', 'zhou', 'zhu', 'zhua', 'zhuai', 'zhuan', 'zhuang',
            'zhui', 'zhun', 'zhuo', 'zi', 'zong', 'zou', 'zu', 'zuan', 'zui',
            'zun', 'zuo'
        ];

        if (idioma.includes('th') || idioma.includes('tailandés')) {
            return ['ka', 'kha', 'ko', 'kho', 'ng', 'ja', 'cha', 'cho', 'd', 'dt', 't', 'th', 'n', 'b', 'bp', 'p', 'ph', 'f', 'm', 'y', 'r', 'l', 'w', 's', 'h', 'a', 'i', 'u', 'e'];
        }

        if (idioma.includes('vi') || idioma.includes('vietnamita')) {
            return ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y', 'ba', 'ca', 'da', 'ga', 'ha', 'la', 'ma', 'na', 'pa', 'qua', 'ra', 'sa', 'ta', 'va', 'xa', 'ya'];
        }

        return SILABAS_CHINO;
    }

    // ============================================================
    // INICIALIZACIÓN - SIN MODAL
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        
        this._idiomaActual = this._obtenerIdiomaActual();
        this._nivelUsuario = this._obtenerNivelRealUsuario();
        
        this._cargarDiccionario();
        this._cargarEstadoCompleto();
        
        this._initDone = true;
        console.log('🎵 UI Tonos v17.6 - Inicializado');
        
        return this;
    }

    // ============================================================
    // CARGAR - AQUÍ SE MUESTRA EL MODAL SI ES NECESARIO (DENTRO DEL MÓDULO)
    // ============================================================

    async cargar(core) {
        this._core = core || this._core;
        this._idiomaActual = this._obtenerIdiomaActual();
        this._nivelUsuario = this._obtenerNivelRealUsuario();
        
        this._cargarDiccionario();
        this._cargarEstadoCompleto();
        
        this._renderizarPanel();
        
        if (Object.keys(this._diccionario).length === 0 && !this._mostrandoModalBienvenida) {
            console.log('📭 Diccionario vacío - mostrando prompt para IA externa dentro del módulo Tonos');
            this._mostrandoModalBienvenida = true;
            setTimeout(() => {
                this._mostrarPromptDiccionario();
            }, 400);
        }
    }

    // ============================================================
    // 📌 MOSTRAR PROMPT PARA DICCIONARIO
    // ============================================================

    _mostrarPromptDiccionario() {
        const core = this._obtenerCore();
        const prompt = this._generarPromptDiccionario();
        
        if (!core) {
            this._crearModalEmergenciaPrompt(prompt, 'diccionario');
            return;
        }

        core.abrirModal('📥 Generar Diccionario Tonal con IA');

        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = prompt;
            textarea.readOnly = false;
            textarea.style.minHeight = '500px';
            textarea.style.fontSize = '13px';
            textarea.style.fontFamily = 'monospace';
            textarea.placeholder = 'Este es el prompt para enviar a la IA...';
        }

        this._agregarInfoPromptDiccionario();
        this._configurarBotonCopiarPrompt();
        this._configurarBotonImportarDiccionario();
    }

    _agregarInfoPromptDiccionario() {
        const modalBody = document.querySelector('.modal-body');
        if (!modalBody) return;
        
        const oldInfo = modalBody.querySelector('#promptInfoDiv');
        if (oldInfo) oldInfo.remove();
        
        const infoDiv = document.createElement('div');
        infoDiv.id = 'promptInfoDiv';
        infoDiv.style.cssText = 'background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius: 8px;padding: 12px 16px;margin-bottom: 12px;font-size: 12px;color: var(--gray);border-left: 4px solid var(--primary);';
        infoDiv.innerHTML = `
            <strong>📋 INSTRUCCIONES:</strong><br>
            1. Este es un <strong>PROMPT</strong> para enviar a una IA externa (Groq, ChatGPT, Claude).<br>
            2. Copia el texto completo y pégalo en la IA de tu elección.<br>
            3. La IA generará un diccionario tonal completo en formato JSON.<br>
            4. Cuando tengas la respuesta, <strong>copia el JSON</strong> y pégalo en el editor.<br>
            5. Pulsa <strong>"Importar JSON"</strong> para guardar el diccionario.<br>
            <br>
            <span style="font-size:11px;color:var(--gray-light);">🎯 Nivel <strong>${this._nivelUsuario}</strong></span><br>
            <span style="font-size:10px;color:var(--success);">🔥 La IA responderá con un JSON que se importa directamente.</span>
            <br>
            <span style="font-size:10px;color:var(--warning);">📌 El prompt solicita SOLO sílabas del nivel ${this._nivelUsuario} para evitar respuestas demasiado largas.</span>
        `;
        modalBody.insertBefore(infoDiv, modalBody.firstChild);
    }

    // ============================================================
    // CONFIGURAR BOTÓN COPIAR PROMPT
    // ============================================================

    _configurarBotonCopiarPrompt() {
        const copyBtn = document.getElementById('jsonCopy');
        if (!copyBtn) return;
        
        const newCopyBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
        
        const self = this;
        newCopyBtn.onclick = function() {
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                navigator.clipboard.writeText(textarea.value)
                    .then(() => {
                        const core = self._obtenerCore();
                        if (core) core.mostrarToast('📋 Prompt copiado al portapapeles', 'success');
                    })
                    .catch(() => {
                        textarea.select();
                        document.execCommand('copy');
                        const core = self._obtenerCore();
                        if (core) core.mostrarToast('📋 Prompt copiado al portapapeles', 'success');
                    });
            }
        };
    }

    // ============================================================
    // CONFIGURAR BOTÓN IMPORTAR DICCIONARIO
    // ============================================================

    _configurarBotonImportarDiccionario() {
        const importBtn = document.getElementById('jsonImport');
        if (!importBtn) {
            const modalActions = document.querySelector('.modal-actions');
            if (modalActions) {
                const newBtn = document.createElement('button');
                newBtn.id = 'jsonImport';
                newBtn.className = 'btn-success';
                newBtn.innerHTML = '<i class="fas fa-file-import"></i> Importar JSON';
                modalActions.appendChild(newBtn);
                this._configurarBotonImportarDiccionario();
            }
            return;
        }
        
        const newImportBtn = importBtn.cloneNode(true);
        importBtn.parentNode.replaceChild(newImportBtn, importBtn);
        
        const self = this;
        newImportBtn.onclick = function() {
            const textarea = document.getElementById('jsonTextarea');
            if (!textarea) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('❌ No se encontró el editor', 'error');
                return;
            }
            const jsonText = textarea.value.trim();
            if (!jsonText) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('❌ No hay JSON para importar', 'error');
                return;
            }
            
            if (jsonText.includes('Tu tarea es generar') || jsonText.includes('Eres un experto')) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('⚠️ Esto es un PROMPT, no un JSON. Pega la RESPUESTA de la IA.', 'warning');
                return;
            }
            
            self._procesarImportacionDiccionario(jsonText, () => {
                const core = self._obtenerCore();
                if (core) {
                    core.cerrarModal();
                    self._modalAbierto = false;
                }
                self._mostrandoModalBienvenida = false;
                self._renderizarPanel();
            });
        };
    }

    // ============================================================
    // CONFIGURAR BOTÓN IMPORTAR HISTORIA
    // ============================================================

    _configurarBotonImportarHistoria(grupo) {
        const importBtn = document.getElementById('jsonImport');
        if (!importBtn) return;
        
        const newImportBtn = importBtn.cloneNode(true);
        importBtn.parentNode.replaceChild(newImportBtn, importBtn);
        
        const self = this;
        newImportBtn.onclick = async function() {
            const textarea = document.getElementById('jsonTextarea');
            if (!textarea) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('❌ No se encontró el editor', 'error');
                return;
            }
            const jsonText = textarea.value.trim();
            if (!jsonText) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('❌ No hay JSON para importar', 'error');
                return;
            }
            
            if (jsonText.includes('Tu tarea es generar') || jsonText.includes('Eres un experto')) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('⚠️ Esto es un PROMPT, no un JSON. Pega la RESPUESTA de la IA.', 'warning');
                return;
            }
            
            try {
                const data = JSON.parse(jsonText);
                if (!data.lineas || !Array.isArray(data.lineas) || data.lineas.length < 8 || data.lineas.length > 10) {
                    throw new Error(`JSON inválido: debe tener entre 8 y 10 líneas (tiene ${data.lineas?.length || 0})`);
                }
                await self._importarHistoriaJSON(data);
                const core = self._obtenerCore();
                if (core) {
                    core.cerrarModal();
                    core.mostrarToast('✅ Historia (8-10 líneas) importada al grupo "' + grupo + '"', 'success');
                }
                self._renderizarPanel();
            } catch (e) {
                const core = self._obtenerCore();
                if (core) core.mostrarToast('❌ Error: ' + e.message, 'error');
            }
        };
    }

    // ============================================================
    // MODAL DE EMERGENCIA PARA PROMPT
    // ============================================================

    _crearModalEmergenciaPrompt(prompt, tipo, grupo) {
        const overlay = document.createElement('div');
        overlay.id = 'modalEmergenciaPrompt';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(10px);
            z-index: 100000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        
        const titulo = tipo === 'diccionario' 
            ? '📥 Generar Diccionario Tonal con IA' 
            : `📖 Generar Historia para "${grupo}" (8-10 líneas)`;
        
        overlay.innerHTML = `
            <div style="background: var(--white, #ffffff); border-radius: 20px; padding: 24px; max-width: 800px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">${titulo}</h3>
                        <p style="font-size: 12px; color: var(--gray); margin: 2px 0 0;">Copia el prompt y pégalo en una IA externa</p>
                    </div>
                    <button onclick="this.closest('div[style]').remove()" style="background: none; border: none; font-size: 28px; color: var(--gray); cursor: pointer; padding: 0 8px;">&times;</button>
                </div>
                <div style="flex: 1; overflow-y: auto; margin-bottom: 12px;">
                    <div style="background: var(--warning)10; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; border-left: 4px solid var(--warning);">
                        <strong style="color: var(--warning);">📌 INSTRUCCIONES:</strong>
                        <ol style="margin: 4px 0 0 16px; font-size: 13px; color: var(--gray);">
                            <li>Copia el <strong>prompt</strong> completo abajo.</li>
                            <li>Pégalo en <strong>Groq, ChatGPT, Claude o cualquier IA</strong>.</li>
                            <li>La IA generará el resultado en formato JSON.</li>
                            <li>Copia el JSON resultante y pégalo en el editor.</li>
                            <li>Pulsa <strong>"Importar"</strong> para guardar.</li>
                        </ol>
                    </div>
                    <textarea id="jsonTextareaEmergencia" rows="20" style="width:100%;padding:12px;border:2px solid var(--light);border-radius:8px;font-size:13px;font-family:monospace;resize:vertical;background:var(--white);color:var(--dark);line-height:1.5;white-space:pre-wrap;">${prompt}</textarea>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; border-top: 1px solid var(--light); padding-top: 12px;">
                    <button id="btnCopiarPromptEmergencia" style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;transition:all 0.3s;">
                        <i class="fas fa-copy"></i> Copiar Prompt
                    </button>
                    <button onclick="this.closest('div[style]').remove()" style="padding:12px 24px;font-size:15px;border:none;border-radius:10px;cursor:pointer;background:var(--light);color:var(--gray);">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const btnCopiar = document.getElementById('btnCopiarPromptEmergencia');
        if (btnCopiar) {
            btnCopiar.onclick = () => {
                const textarea = document.getElementById('jsonTextareaEmergencia');
                if (textarea) {
                    navigator.clipboard.writeText(textarea.value)
                        .then(() => alert('📋 Prompt copiado al portapapeles'))
                        .catch(() => {
                            textarea.select();
                            document.execCommand('copy');
                            alert('📋 Prompt copiado al portapapeles');
                        });
                }
            };
        }
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        overlay._escapeHandler = escapeHandler;
    }

    // ============================================================
    // PROCESAR IMPORTACIÓN DE DICCIONARIO
    // ============================================================

    async _procesarImportacionDiccionario(jsonText, callback) {
        if (this._importando) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }

        this._importando = true;
        const core = this._obtenerCore();
        if (core) core.mostrarToast('🔍 Validando JSON...', 'info');

        try {
            const data = JSON.parse(jsonText);
            
            if (typeof data !== 'object' || Object.keys(data).length === 0) {
                throw new Error('El JSON debe ser un objeto con sílabas');
            }
            
            const primeraClave = Object.keys(data)[0];
            const primeraSilaba = data[primeraClave];
            if (!primeraSilaba.silaba || !primeraSilaba.tonos) {
                throw new Error('Formato inválido. Cada sílaba debe tener "silaba" y "tonos"');
            }
            
            const primerTonoClave = Object.keys(primeraSilaba.tonos)[0];
            const primerTono = primeraSilaba.tonos[primerTonoClave];
            if (!primerTono.caracter || !primerTono.significado || !primerTono.nivel) {
                throw new Error('Formato inválido. Cada tono debe tener "caracter", "significado" y "nivel"');
            }
            
            this._diccionario = data;
            this._diccionarioCargado = true;
            this._primeraCarga = false;
            this._guardarDiccionario();
            
            this._todasLasHistorias = {};
            this._historiasGrupo = [];
            this._grupoActual = null;
            this._grupoData = null;
            this._historiasGuardadas = {};
            this._historiasLeidas = new Set();
            this._guardarEstadoCompleto();
            
            if (core) {
                core.mostrarToast(`✅ Diccionario importado: ${Object.keys(data).length} sílabas`, 'success');
            }
            
            if (callback) callback();
            this._renderizarPanel();
            
        } catch (error) {
            console.error('❌ Error importando diccionario:', error);
            if (core) {
                core.mostrarToast('❌ Error: ' + error.message, 'error');
            }
            alert('❌ Error al importar el diccionario:\n\n' + error.message + '\n\nVerifica que el JSON tenga el formato correcto.');
        } finally {
            this._importando = false;
        }
    }

    // ============================================================
    // IMPORTAR DICCIONARIO DESDE JSON
    // ============================================================

    async _importarDiccionarioJSON() {
        if (this._importando) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }

        const core = this._obtenerCore();
        if (!core) {
            this._crearModalEmergenciaPrompt(this._generarPromptDiccionario(), 'diccionario');
            return;
        }

        this._mostrarPromptDiccionario();
    }

    // ============================================================
    // EXPORTAR DICCIONARIO A JSON
    // ============================================================

    _exportarDiccionarioJSON() {
        if (Object.keys(this._diccionario).length === 0) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ No hay diccionario para exportar', 'error');
            return;
        }

        try {
            const json = JSON.stringify(this._diccionario, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `diccionario_tonal_${this._idiomaActual}_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            const core = this._obtenerCore();
            if (core) {
                core.mostrarToast(`📤 Diccionario exportado: ${Object.keys(this._diccionario).length} sílabas`, 'success');
            }
        } catch (error) {
            console.error('❌ Error exportando diccionario:', error);
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GENERAR HISTORIA - CON CONTINUIDAD
    // ============================================================

    _generarHistoriaJSON() {
        if (this._generando) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('⏳ Ya hay una generación en curso', 'warning');
            return;
        }

        if (!this._grupoActual || !this._grupoData) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Selecciona un grupo primero', 'error');
            return;
        }

        const ultimaHistoria = this._historiasGrupo.length > 0 ? this._historiasGrupo[this._historiasGrupo.length - 1] : null;
        if (ultimaHistoria) {
            console.log(`🔄 Generando historia (8-10 líneas) CONTINUANDO "${ultimaHistoria.titulo || 'la anterior'}"`);
        }

        this._generando = true;
        this._mostrarPromptHistoria(this._grupoActual, this._grupoData);
        this._generando = false;
    }

    // ============================================================
    // MOSTRAR PROMPT HISTORIA
    // ============================================================

    _mostrarPromptHistoria(grupo, data) {
        const core = this._obtenerCore();
        
        const ultimaHistoria = this._historiasGrupo.length > 0 ? this._historiasGrupo[this._historiasGrupo.length - 1] : null;
        const prompt = this._generarPromptHistoria(grupo, data, ultimaHistoria);
        
        if (!core) {
            this._crearModalEmergenciaPrompt(prompt, 'historia', grupo);
            return;
        }

        const tituloModal = ultimaHistoria 
            ? `📖 Generar Historia para "${grupo}" (8-10 líneas, continúa la anterior)` 
            : `📖 Generar Historia para "${grupo}" (8-10 líneas)`;

        core.abrirModal(tituloModal);

        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = prompt;
            textarea.readOnly = false;
            textarea.style.minHeight = '450px';
            textarea.style.fontSize = '13px';
            textarea.style.fontFamily = 'monospace';
            textarea.placeholder = 'Este es el prompt para enviar a la IA...';
        }

        this._agregarInfoPromptHistoria(grupo, data, ultimaHistoria);
        this._configurarBotonCopiarPrompt();
        this._configurarBotonImportarHistoria(grupo);
    }

    _agregarInfoPromptHistoria(grupo, data, ultimaHistoria) {
        const modalBody = document.querySelector('.modal-body');
        if (!modalBody) return;
        
        const oldInfo = modalBody.querySelector('#promptInfoDiv');
        if (oldInfo) oldInfo.remove();
        
        const tonosKeys = Object.keys(data.tonos);
        const tonosDesc = tonosKeys.map(t => {
            const info = data.tonos[t];
            const color = this._getColorTono(t);
            return `<span style="color:${color};font-weight:700;">${t}</span> (${info.caracter}) - ${info.significado}`;
        }).join(' · ');
        
        let continuidadHTML = '';
        if (ultimaHistoria) {
            const tituloAnterior = ultimaHistoria.titulo || 'Sin título';
            const frasesAnteriores = ultimaHistoria.frases || [];
            const ultimaFrase = frasesAnteriores.length > 0 ? frasesAnteriores[frasesAnteriores.length - 1] : null;
            const ultimoTexto = ultimaFrase ? (ultimaFrase.hanzi || ultimaFrase.original || '') : '';
            
            continuidadHTML = `
                <br><br>
                <div style="background:var(--success)08;border-radius:6px;padding:8px 12px;border-left:3px solid var(--success);">
                    <span style="font-size:11px;color:var(--success);font-weight:600;">🔄 CONTINUIDAD ACTIVADA</span><br>
                    <span style="font-size:10px;color:var(--gray-light);">
                        Última historia: "<strong style="color:var(--dark);">${tituloAnterior}</strong>"<br>
                        Última frase: "<span style="color:var(--primary);font-weight:500;">${ultimoTexto}</span>"<br>
                        <span style="color:var(--info);">La nueva historia (8-10 líneas) CONTINUARÁ la trama desde donde terminó.</span>
                    </span>
                </div>
            `;
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.id = 'promptInfoDiv';
        infoDiv.style.cssText = 'background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius: 8px;padding: 12px 16px;margin-bottom: 12px;font-size: 12px;color: var(--gray);border-left: 4px solid var(--primary);';
        infoDiv.innerHTML = `
            <strong>📋 INSTRUCCIONES para la sílaba "<span style="color:var(--primary);font-weight:700;">${grupo}</span>":</strong><br>
            1. Este es un <strong>PROMPT</strong> para enviar a una IA externa.<br>
            2. Copia el texto completo y pégalo en la IA de tu elección.<br>
            3. La IA generará una historia de <strong>8 a 10 líneas</strong> que usa TODOS los tonos de "${grupo}".<br>
            4. Cuando tengas la respuesta, <strong>copia el JSON</strong> y pégalo en el editor.<br>
            5. Pulsa <strong>"Importar Historia"</strong> para guardarla en el grupo.<br>
            <br>
            <span style="font-size:11px;color:var(--gray-light);">🎵 Tonos: ${tonosDesc}</span><br>
            <span style="font-size:10px;color:var(--success);">🔥 La IA generará una historia de 8-10 líneas en ${this._getNombreIdioma(this._idiomaActual)}.</span>
            ${continuidadHTML}
            <br>
            <span style="font-size:10px;color:var(--warning);">📏 La historia debe tener ENTRE 8 Y 10 LÍNEAS. No menos de 8, no más de 10.</span>
        `;
        modalBody.insertBefore(infoDiv, modalBody.firstChild);
    }

    // ============================================================
    // IMPORTAR HISTORIA JSON (CON VALIDACIÓN DE 8-10 LÍNEAS)
    // ============================================================

    async _importarHistoriaJSON(data) {
        if (this._importando) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }

        if (!data || !data.lineas || !Array.isArray(data.lineas) || data.lineas.length === 0) {
            throw new Error('JSON inválido: debe contener "lineas"');
        }

        if (data.lineas.length < 8 || data.lineas.length > 10) {
            throw new Error(`La historia debe tener entre 8 y 10 líneas (tiene ${data.lineas.length})`);
        }

        if (!this._grupoActual) {
            throw new Error('No hay grupo seleccionado. Selecciona un grupo primero.');
        }

        this._importando = true;

        try {
            const idioma = data.meta?.idioma || this._idiomaActual || 'zh';
            const nivel = data.meta?.nivel || this._nivelUsuario;
            const grupo = data.meta?.grupo || this._grupoActual;
            const titulo = data.titulo || 'Historia del grupo "' + grupo + '"';
            
            const historia = {
                titulo: titulo,
                tono: data.lineas[0]?.tono_usado || 'Desconocido',
                frases: [],
                completada: false,
                resumen: ''
            };

            for (let i = 0; i < data.lineas.length; i++) {
                const l = data.lineas[i];
                if (!l.hanzi || !l.pinyin || !l.traduccion) continue;
                
                historia.frases.push({
                    hanzi: l.hanzi,
                    pinyin: l.pinyin,
                    traduccion: l.traduccion,
                    tono: l.tono_usado || 'Desconocido',
                    palabras: l.palabras || []
                });
            }

            if (historia.frases.length === 0) {
                throw new Error('No se encontraron frases válidas en el JSON');
            }

            let resumen = '';
            for (let j = 0; j < Math.min(3, historia.frases.length); j++) {
                resumen += (historia.frases[j].hanzi || '') + ' ... ';
            }
            historia.resumen = resumen;

            const idx = this._historiasGrupo.length;
            this._historiasGrupo.push(historia);
            this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;

            this._guardarEstadoCompleto();
            this._renderizarPanel();

            const core = this._obtenerCore();
            if (core) {
                core.mostrarToast('✅ Historia "' + titulo + '" (8-10 líneas) importada al grupo "' + this._grupoActual + '" (' + historia.frases.length + ' frases)', 'success');
            }

        } catch (error) {
            console.error('❌ Error importando historia:', error);
            throw new Error('Error en el JSON: ' + error.message);
        } finally {
            this._importando = false;
        }
    }

    // ============================================================
    // PERSISTENCIA - GUARDAR ESTADO
    // ============================================================

    _guardarEstadoCompleto() {
        if (!this._idiomaActual) return;
        
        try {
            const key = `${this._persistenciaKey}_${this._idiomaActual}`;
            
            const data = {
                version: '17.6',
                timestamp: Date.now(),
                idioma: this._idiomaActual,
                nivelUsuario: this._nivelUsuario,
                todasLasHistorias: this._todasLasHistorias || {},
                historiasGuardadas: this._historiasGuardadas || {},
                historiasLeidas: Array.from(this._historiasLeidas || new Set()),
                grupoActual: this._grupoActual,
                visorOcultarTraduccion: this._visorOcultarTraduccion
            };
            
            localStorage.setItem(key, JSON.stringify(data));
            this._guardarEnIndexedDB(key, data);
            
        } catch (e) {
            console.warn('⚠️ Error guardando estado:', e);
        }
    }

    async _guardarEnIndexedDB(key, data) {
        try {
            if (typeof db === 'undefined' || !db || !db._initialized) return;

            const configs = await db.getByIndex('configuracion', 'clave', key);
            
            if (configs && configs.length > 0) {
                await db.update('configuracion', {
                    ...configs[0],
                    valor: JSON.stringify(data),
                    timestamp: Date.now()
                });
            } else {
                await db.add('configuracion', {
                    clave: key,
                    valor: JSON.stringify(data),
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.warn('⚠️ Error guardando en IndexedDB:', error);
        }
    }

    _cargarEstadoCompleto() {
        if (!this._idiomaActual) return false;
        
        try {
            const key = `${this._persistenciaKey}_${this._idiomaActual}`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const data = JSON.parse(stored);
                
                this._todasLasHistorias = data.todasLasHistorias || {};
                this._historiasGuardadas = data.historiasGuardadas || {};
                this._historiasLeidas = new Set(data.historiasLeidas || []);
                this._nivelUsuario = data.nivelUsuario || this._nivelUsuario;
                this._visorOcultarTraduccion = data.visorOcultarTraduccion || false;
                
                if (data.grupoActual && this._todasLasHistorias[data.grupoActual]) {
                    this._grupoActual = data.grupoActual;
                    this._historiasGrupo = this._todasLasHistorias[data.grupoActual] || [];
                    this._grupoData = this._diccionario[data.grupoActual] || null;
                }
                
                return true;
            }
            
            this._todasLasHistorias = {};
            this._historiasGrupo = [];
            return false;
            
        } catch (e) {
            console.warn('⚠️ Error cargando estado:', e);
            this._todasLasHistorias = {};
            this._historiasGrupo = [];
            return false;
        }
    }

    // ============================================================
    // CONFIGURAR GUARDADO AUTOMÁTICO
    // ============================================================

    _configurarGuardadoAutomatico() {
        const self = this;
        
        window.addEventListener('beforeunload', function() {
            if (self._grupoActual && self._historiasGrupo.length > 0) {
                self._todasLasHistorias[self._grupoActual] = self._historiasGrupo;
            }
            self._guardarEstadoCompleto();
        });
        
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                if (self._grupoActual && self._historiasGrupo.length > 0) {
                    self._todasLasHistorias[self._grupoActual] = self._historiasGrupo;
                }
                self._guardarEstadoCompleto();
            }
        });
        
        setInterval(function() {
            if (self._grupoActual && self._historiasGrupo.length > 0) {
                self._todasLasHistorias[self._grupoActual] = self._historiasGrupo;
            }
            self._guardarEstadoCompleto();
        }, 30000);
    }

    // ============================================================
    // CONFIGURAR LISTENERS
    // ============================================================

    _configurarListeners() {
        window.removeEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        
        this._handleIdiomaCambiado = function(e) {
            const nuevoIdioma = e.detail?.idioma;
            if (!nuevoIdioma) return;
            
            if (this._grupoActual && this._historiasGrupo.length > 0) {
                this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;
            }
            this._guardarEstadoCompleto();
            
            this._idiomaActual = nuevoIdioma;
            this._nivelUsuario = this._obtenerNivelRealUsuario();
            
            this._cargarDiccionario();
            this._cargarEstadoCompleto();
            
            this._grupoActual = null;
            this._historiasGrupo = [];
            
            if (this._container && this._container.offsetParent !== null) {
                this._renderizarPanel();
            }
            
            console.log(`🔄 Idioma cambiado a: ${nuevoIdioma}`);
        }.bind(this);
        
        window.addEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        window.addEventListener('nivelIdiomaCambiado', function(e) {
            this._nivelUsuario = e.detail?.nivel || this._obtenerNivelRealUsuario();
            this._renderizarPanel();
        }.bind(this));
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _obtenerIdiomaActual() {
        try {
            return gestorIdiomas?.getIdiomaActivo() || 'zh';
        } catch (e) {
            return 'zh';
        }
    }

    _esTonal(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_TONALES.some(function(item) {
            return idiomaLower.includes(item) || item.includes(idiomaLower);
        });
    }

    _getNombreIdioma(idioma) {
        const nombres = {
            'es': 'Español', 'en': 'Inglés', 'fr': 'Francés',
            'de': 'Alemán', 'it': 'Italiano', 'pt': 'Portugués',
            'zh': 'Chino', 'ja': 'Japonés', 'ko': 'Coreano',
            'ru': 'Ruso', 'ar': 'Árabe', 'hi': 'Hindi',
            'th': 'Tailandés', 'vi': 'Vietnamita'
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
                const idiomaActivo = window.gestorIdiomas?.getIdiomaActivo?.() || 'zh';
                const idiomaObj = parsed.idiomasObjetivo?.find(function(i) { return i.idioma === idiomaActivo; });
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

    _getContainer() {
        if (!this._container) {
            this._container = document.getElementById('tonosContent');
            if (!this._container) {
                const moduleDiv = document.getElementById('tonosModule');
                if (moduleDiv) {
                    this._container = moduleDiv.querySelector('.module-content');
                    if (!this._container) {
                        this._container = document.createElement('div');
                        this._container.id = 'tonosContent';
                        this._container.className = 'module-content';
                        moduleDiv.appendChild(this._container);
                    }
                }
            }
        }
        return this._container;
    }

    // ============================================================
    // OBTENER GRUPOS POR NIVEL
    // ============================================================

    _getGruposPorNivel() {
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const idxNivel = niveles.indexOf(this._nivelUsuario);
        const nivelesPermitidos = niveles.slice(0, idxNivel + 1);
        
        const gruposFiltrados = {};
        
        for (const [nombre, grupo] of Object.entries(this._diccionario)) {
            const tonosFiltrados = {};
            let tieneTonos = false;
            
            for (const [tono, info] of Object.entries(grupo.tonos)) {
                if (nivelesPermitidos.includes(info.nivel)) {
                    tonosFiltrados[tono] = info;
                    tieneTonos = true;
                }
            }
            
            if (tieneTonos) {
                gruposFiltrados[nombre] = {
                    ...grupo,
                    tonos: tonosFiltrados,
                    tonosCompletos: grupo.tonos
                };
            }
        }
        
        return gruposFiltrados;
    }

    // ============================================================
    // CAMBIAR GRUPO
    // ============================================================

    _cambiarGrupo(nuevoGrupo) {
        if (this._grupoActual && this._historiasGrupo.length > 0) {
            this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;
        }
        
        this._grupoActual = nuevoGrupo;
        this._grupoData = this._diccionario[nuevoGrupo] || null;
        
        if (this._todasLasHistorias[nuevoGrupo]) {
            this._historiasGrupo = this._todasLasHistorias[nuevoGrupo];
        } else {
            this._historiasGrupo = [];
            this._todasLasHistorias[nuevoGrupo] = [];
        }
        
        this._paginaHistorias = 1;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL
    // ============================================================

    _renderizarPanel() {
        const container = this._getContainer();
        if (!container) return;

        if (this._visorAbierto) {
            this._renderizarVisor();
            return;
        }

        const idiomaActivo = this._idiomaActual;
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const esTonal = this._esTonal(idiomaActivo);

        if (!esTonal) {
            container.innerHTML = this._renderizarNoTonal(nombreIdioma);
            return;
        }

        if (Object.keys(this._diccionario).length === 0) {
            container.innerHTML = this._renderizarSinDiccionario();
            return;
        }

        const grupos = this._getGruposPorNivel();
        const nombresGrupos = Object.keys(grupos);
        const gruposFiltrados = this._filtrarGrupos(nombresGrupos);
        const total = gruposFiltrados.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._itemsPorPagina));
        
        if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
        if (this._paginaActual < 1) this._paginaActual = 1;
        
        const inicio = (this._paginaActual - 1) * this._itemsPorPagina;
        const fin = Math.min(inicio + this._itemsPorPagina, total);
        const itemsPagina = gruposFiltrados.slice(inicio, fin);

        let totalHistorias = 0;
        for (const g of nombresGrupos) {
            totalHistorias += (this._todasLasHistorias[g] || []).length;
        }

        let html = '<div class="tonos-container" style="padding:16px;">';
        html += this._renderizarHeader(nombreIdioma, totalHistorias, nombresGrupos.length);
        html += this._renderizarBotonesDiccionario();
        html += this._renderizarFiltros();
        html += this._renderizarGrillaGrupos(itemsPagina, gruposFiltrados, total, totalPaginas);
        
        if (this._grupoActual && this._grupoData) {
            html += this._renderizarGrupoActualCompleto();
        }
        
        html += this._renderizarEstadisticas(idiomaActivo);
        html += '</div>';

        container.innerHTML = html;
    }

    // ============================================================
    // RENDERIZAR GRUPO ACTUAL COMPLETO
    // ============================================================

    _renderizarGrupoActualCompleto() {
        if (!this._grupoActual || !this._grupoData) return '';
        
        const grupo = this._grupoData;
        const tonos = Object.keys(grupo.tonos);
        const historias = this._historiasGrupo || [];
        const totalHistorias = historias.length;
        const totalPaginas = Math.max(1, Math.ceil(totalHistorias / this._historiasPorPagina));
        
        if (this._paginaHistorias > totalPaginas) this._paginaHistorias = totalPaginas;
        if (this._paginaHistorias < 1) this._paginaHistorias = 1;
        
        const inicio = (this._paginaHistorias - 1) * this._historiasPorPagina;
        const fin = Math.min(inicio + this._historiasPorPagina, totalHistorias);
        const historiasPagina = historias.slice(inicio, fin);
        
        let html = `
            <div style="margin-top:20px;background:var(--white);border-radius:12px;padding:16px 20px;border:2px solid var(--primary)30;box-shadow:var(--shadow);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
                    <div>
                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">
                            🎯 Grupo: <span style="color:var(--primary);font-size:28px;">${this._grupoActual}</span>
                            <span style="font-size:12px;font-weight:400;color:var(--gray-light);">(${tonos.length} tonos)</span>
                        </h3>
                        <div style="display:flex;gap:12px;margin-top:6px;flex-wrap:wrap;">
                            ${tonos.map(t => {
                                const info = grupo.tonos[t];
                                const esNivel = info.nivel === this._nivelUsuario;
                                const color = this._getColorTono(t);
                                return `<span style="display:inline-flex;align-items:center;gap:8px;font-size:22px;font-weight:${esNivel ? '700' : '400'};color:${color};padding:4px 14px;background:${esNivel ? color + '20' : 'var(--bg)'};border-radius:10px;border:2px solid ${color}50;">
                                    ${info.caracter} <span style="font-size:16px;color:${color};">${t}</span>
                                    <span style="font-size:10px;color:var(--gray-light);">${info.significado}</span>
                                </span>`;
                            }).join('')}
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UITonos._cerrarGrupo()" style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                            <i class="fas fa-times"></i> Cerrar grupo
                        </button>
                        <button class="btn-primary" onclick="window.UITonos._generarHistoriaJSON()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-magic"></i> Generar Historia (8-10 líneas)
                        </button>
                        <button class="btn-success" onclick="window.UITonos._guardarTodasHistorias()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-save"></i> Guardar Todo
                        </button>
                    </div>
                </div>
        `;
        
        // 🔥 TARJETAS DE TONOS CON COLORES
        html += `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:16px;">
                ${tonos.map(t => {
                    const info = grupo.tonos[t];
                    const color = this._getColorTono(t);
                    const esNivel = info.nivel === this._nivelUsuario;
                    return `
                        <div style="background:${esNivel ? color + '15' : 'var(--bg)'};border-radius:10px;padding:14px 18px;border:2px solid ${esNivel ? color : 'var(--light)'};text-align:center;">
                            <div style="display:flex;justify-content:center;align-items:center;gap:14px;">
                                <span style="font-size:42px;font-weight:800;color:${color};text-shadow: 0 0 16px ${color}40;">${info.caracter}</span>
                                <span style="font-size:26px;font-weight:700;color:${color};">${t}</span>
                            </div>
                            <div style="font-size:15px;color:var(--gray);margin-top:6px;">${info.significado}</div>
                            <div style="font-size:12px;color:var(--gray-light);margin-top:3px;">
                                ${esNivel ? '✅ Tu nivel' : '📚 Nivel ' + info.nivel}
                            </div>
                            ${info.ejemplos ? `<div style="font-size:12px;color:var(--gray-light);margin-top:6px;padding:6px 10px;background:var(--bg);border-radius:6px;">${info.ejemplos.slice(0, 2).join(' · ')}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // 🔥 SECCIÓN DE HISTORIAS DEL GRUPO CON PAGINACIÓN
        if (historias.length > 0) {
            html += `
                <div style="margin-top:12px;border-top:2px solid var(--light);padding-top:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <h4 style="font-size:14px;font-weight:600;color:var(--dark);margin:0;">📖 Historias del grupo (${historias.length})</h4>
                            <span style="font-size:10px;color:var(--success);">✅ ${this._historiasLeidas.size} leídas</span>
                            ${totalPaginas > 1 ? `<span style="font-size:10px;color:var(--gray-light);">· Página ${this._paginaHistorias}/${totalPaginas}</span>` : ''}
                        </div>
                        <div style="display:flex;gap:6px;">
                            ${totalPaginas > 1 ? `
                                <button class="btn-secondary" onclick="window.UITonos._irPaginaHistorias(${this._paginaHistorias - 1})" style="padding:2px 10px;font-size:10px;${this._paginaHistorias <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaHistorias <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <span style="font-size:11px;color:var(--gray);">${this._paginaHistorias}/${totalPaginas}</span>
                                <button class="btn-secondary" onclick="window.UITonos._irPaginaHistorias(${this._paginaHistorias + 1})" style="padding:2px 10px;font-size:10px;${this._paginaHistorias >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaHistorias >= totalPaginas ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
            `;
            
            for (let i = 0; i < historiasPagina.length; i++) {
                const historia = historiasPagina[i];
                const idx = inicio + i;
                const key = 'historia_' + this._grupoActual + '_' + idx;
                const esGuardada = this._historiasGuardadas[key] === true;
                const esLeida = this._historiasLeidas.has(key);
                const completada = historia.completada || false;
                
                const titulo = historia.titulo || 'Historia de tonos';
                const tonoColor = this._getColorTono(historia.tono || '');
                
                const esContinuacion = i > 0 && historia._continuaDe !== undefined;
                const badgeContinuidad = esContinuacion ? ' 🔄 Continúa' : '';
                const numLineas = historia.frases ? historia.frases.length : 0;
                
                html += `
                    <div style="background:${esLeida ? 'var(--success)04' : 'var(--bg)'};border-radius:10px;padding:12px 16px;border:2px solid ${completada ? 'var(--success)' : (esLeida ? 'var(--success)' : 'var(--light)')};display:flex;flex-direction:column;gap:6px;cursor:pointer;" 
                         onclick="window.UITonos._leerHistoriaCompleta(${idx})"
                         onmouseover="this.style.borderColor='var(--primary)'" 
                         onmouseout="this.style.borderColor='${completada ? 'var(--success)' : (esLeida ? 'var(--success)' : 'var(--light)')}'">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:16px;font-weight:700;color:${completada ? 'var(--success)' : 'var(--dark)'};">${completada ? '✅' : '📖'} ${titulo}${badgeContinuidad}</span>
                                ${historia.tono ? `<span style="font-size:11px;color:${tonoColor};font-weight:600;background:${tonoColor}10;padding:2px 12px;border-radius:12px;">🎵 ${historia.tono}</span>` : ''}
                                ${completada ? `<span style="font-size:10px;color:var(--success);font-weight:600;">✅ Completada</span>` : ''}
                                ${esLeida ? `<span style="font-size:10px;color:var(--info);font-weight:600;">📖 Leída</span>` : ''}
                                ${esGuardada ? `<span style="font-size:10px;color:var(--success);font-weight:600;">⭐ Guardada</span>` : ''}
                                ${i > 0 ? `<span style="font-size:9px;color:var(--secondary);font-weight:500;">🔄 Cap. ${i+1}</span>` : ''}
                                <span style="font-size:9px;color:var(--gray-light);">📏 ${numLineas} líneas</span>
                            </div>
                            <span style="font-size:11px;color:var(--gray-light);">${numLineas} frases</span>
                        </div>
                        <div style="font-size:12px;color:var(--gray-light);padding-left:10px;border-left:2px solid ${completada ? 'var(--success)' : 'var(--light)'};">
                            ${historia.resumen || 'Sin resumen disponible'}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;border-top:1px solid var(--light);padding-top:6px;margin-top:2px;">
                            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                                <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${completada ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${completada ? 'var(--success)' : 'var(--light)'};" onclick="event.stopPropagation();">
                                    <input type="checkbox" ${completada ? 'checked' : ''} onchange="window.UITonos._toggleHistoriaCompletada(${idx}, this.checked)" style="margin:0;width:12px;height:12px;cursor:pointer;">
                                    <span style="color:${completada ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${completada ? '✅' : '⬜'}</span>
                                    <span style="font-size:7px;color:var(--gray-light);">Completada</span>
                                </label>
                                <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${esLeida ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};" onclick="event.stopPropagation();">
                                    <input type="checkbox" ${esLeida ? 'checked' : ''} onchange="window.UITonos._toggleHistoriaLeida(${idx}, this.checked)" style="margin:0;width:12px;height:12px;cursor:pointer;">
                                    <span style="color:${esLeida ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${esLeida ? '✅' : '⬜'}</span>
                                    <span style="font-size:7px;color:var(--gray-light);">Leída</span>
                                </label>
                            </div>
                            <div style="display:flex;gap:4px;">
                                ${!esGuardada ? `
                                    <button onclick="event.stopPropagation();window.UITonos._guardarHistoria(${idx})" 
                                            style="padding:2px 12px;font-size:10px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:4px;cursor:pointer;">
                                        <i class="fas fa-save"></i> Guardar
                                    </button>
                                ` : ''}
                                <button onclick="event.stopPropagation();window.UITonos._leerHistoriaCompleta(${idx})" 
                                        style="padding:2px 12px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-book"></i> Leer
                                </button>
                                <button onclick="event.stopPropagation();window.UITonos._estudiarHistoriaCompleta(${idx})" 
                                        style="padding:2px 12px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-play"></i> Estudiar
                                </button>
                                <button onclick="event.stopPropagation();window.UITonos._eliminarHistoria(${idx})" 
                                        style="padding:2px 12px;font-size:10px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;" 
                                        title="Eliminar esta historia">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div></div>';
        } else {
            html += `
                <div style="text-align:center;padding:20px;color:var(--gray-light);background:var(--bg);border-radius:8px;border:2px dashed var(--light);margin-top:12px;">
                    <div style="font-size:32px;margin-bottom:8px;">📖</div>
                    <p style="font-size:13px;">No hay historias para este grupo.</p>
                    <p style="font-size:11px;">Usa el botón <strong>"Generar Historia"</strong> para crear una de 8-10 líneas.</p>
                    <p style="font-size:10px;color:var(--gray-light);">💡 Las nuevas historias continuarán automáticamente la trama de la anterior.</p>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    // ============================================================
    // RENDERIZAR GRILLA DE GRUPOS
    // ============================================================

    _renderizarGrillaGrupos(itemsPagina, gruposFiltrados, total, totalPaginas) {
        if (itemsPagina.length === 0) {
            return `
                <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                    <div style="font-size:48px;margin-bottom:16px;">🔍</div>
                    <p style="font-size:16px;font-weight:500;">No se encontraron grupos</p>
                    <p style="font-size:13px;color:var(--gray-light);">Prueba con otro filtro o busca otro término</p>
                    <button class="btn-secondary" onclick="window.UITonos._limpiarFiltros()" style="margin-top:8px;padding:6px 16px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-undo"></i> Limpiar filtros
                    </button>
                </div>
            `;
        }

        let html = '<div style="background:var(--white);border-radius:12px;padding:16px 20px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">';
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:4px;">
            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">🎯 Grupos de sílabas <span style="font-size:12px;font-weight:400;color:var(--gray-light);">(${total})</span></h3>
            <span style="font-size:11px;color:var(--gray-light);">Mostrando ${itemsPagina.length} de ${total}</span>
        </div>`;
        
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">';
        
        for (let i = 0; i < itemsPagina.length; i++) {
            const nombre = itemsPagina[i];
            const grupo = this._diccionario[nombre];
            if (!grupo) continue;
            
            const tonos = Object.keys(grupo.tonos);
            const totalHistoriasGrupo = (this._todasLasHistorias[nombre] || []).length;
            const esActivo = this._grupoActual === nombre;
            
            const caracteresHtml = tonos.map(t => {
                const info = grupo.tonos[t];
                const color = this._getColorTono(t);
                const esNivel = info.nivel === this._nivelUsuario;
                return `<span style="font-size:32px;font-weight:700;color:${color};margin-right:4px;${esNivel ? 'text-shadow: 0 0 12px ' + color + '60;' : ''}">${info.caracter}</span>`;
            }).join('');
            
            const tonosLabels = tonos.map(t => {
                const info = grupo.tonos[t];
                const esNivel = info.nivel === this._nivelUsuario;
                const color = this._getColorTono(t);
                return `<span style="font-size:14px;font-weight:600;color:${color};padding:2px 10px;border-radius:8px;background:${esNivel ? color + '20' : 'var(--bg)'};border:1px solid ${color}40;">${t}</span>`;
            }).join('');
            
            html += `
                <div style="background:${esActivo ? 'var(--primary)08' : 'var(--bg)'};border-radius:10px;padding:12px 14px;border:2px solid ${esActivo ? 'var(--primary)' : 'var(--light)'};cursor:pointer;transition:all 0.3s;${esActivo ? 'box-shadow: 0 0 20px rgba(108,92,231,0.15);' : ''}"
                     onclick="window.UITonos._seleccionarGrupo('${nombre}')"
                     onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'" 
                     onmouseout="this.style.transform='none';this.style.boxShadow='${esActivo ? '0 0 20px rgba(108,92,231,0.15)' : 'none'}'">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:24px;font-weight:700;color:var(--dark);">${nombre}</span>
                        ${esActivo ? '<span style="font-size:10px;color:var(--primary);font-weight:600;">▶ ACTIVO</span>' : ''}
                        <span style="font-size:10px;color:${totalHistoriasGrupo > 0 ? 'var(--success)' : 'var(--gray-light)'};">${totalHistoriasGrupo > 0 ? '📖 ' + totalHistoriasGrupo : '📭'}</span>
                    </div>
                    <div style="font-size:28px;letter-spacing:6px;margin:6px 0;padding:6px 0;background:var(--bg);border-radius:8px;text-align:center;min-height:50px;">
                        ${caracteresHtml}
                    </div>
                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;justify-content:center;">
                        ${tonosLabels}
                    </div>
                    <div style="font-size:10px;color:var(--gray-light);text-align:center;margin-top:4px;">
                        ${Object.values(grupo.tonos).filter(t => t.nivel === this._nivelUsuario).length} en tu nivel
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        
        if (totalPaginas > 1) {
            html += `
                <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.UITonos._irPagina(${this._paginaActual - 1})" 
                            style="padding:4px 12px;font-size:11px;${this._paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" 
                            ${this._paginaActual <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span style="font-size:12px;color:var(--gray);">${this._paginaActual} / ${totalPaginas}</span>
                    <button class="btn-secondary" onclick="window.UITonos._irPagina(${this._paginaActual + 1})" 
                            style="padding:4px 12px;font-size:11px;${this._paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" 
                            ${this._paginaActual >= totalPaginas ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }
        
        html += `<div style="margin-top:8px;font-size:10px;color:var(--gray-light);text-align:center;">
            💡 Haz clic en un grupo para ver sus tonos e historias
            ${this._busqueda ? ' · 🔎 ' + total + ' resultados para "' + this._busqueda + '"' : ''}
        </div>`;
        html += '</div>';
        
        return html;
    }

    // ============================================================
    // RENDERIZAR VISOR
    // ============================================================

    _renderizarVisor() {
        const container = this._getContainer();
        if (!container) return;
        
        const historia = this._historiaActual;
        if (!historia) {
            this._visorAbierto = false;
            this._renderizarPanel();
            return;
        }

        const tonoColor = this._getColorTono(historia.tono);
        const ocultarTraduccion = this._visorOcultarTraduccion;

        let html = '<div style="padding:16px;max-width:900px;margin:0 auto;">';
        
        html += `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;padding:12px 18px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:12px;border:2px solid var(--primary)20;">
                <button class="btn-secondary" onclick="window.UITonos._cerrarVisor()" style="padding:6px 14px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
                <span style="font-size:24px;">📖</span>
                <div style="flex:1;">
                    <h2 style="font-size:20px;font-weight:800;color:var(--dark);margin:0;">${historia.titulo}</h2>
                    <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">
                        🎵 Grupo: <span style="font-weight:600;color:${tonoColor};">${historia.grupo}</span>
                        · ${historia.frases.length} frases
                    </p>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:4px 12px;background:${ocultarTraduccion ? 'var(--warning)15' : 'var(--bg)'};border-radius:8px;border:1px solid ${ocultarTraduccion ? 'var(--warning)' : 'var(--light)'};">
                        <input type="checkbox" ${ocultarTraduccion ? 'checked' : ''} onchange="window.UITonos._toggleVisorTraduccion(this.checked)" style="margin:0;width:14px;height:14px;cursor:pointer;">
                        <span style="color:${ocultarTraduccion ? 'var(--warning)' : 'var(--gray)'};">${ocultarTraduccion ? '🔒' : '👁️'}</span>
                    </label>
                    <button class="btn-primary" onclick="window.UITonos._estudiarHistoriaVisor()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                        <i class="fas fa-play"></i> Estudiar
                    </button>
                </div>
            </div>
        `;
        
        html += '<div style="display:flex;flex-direction:column;gap:12px;">';
        
        for (let i = 0; i < historia.frases.length; i++) {
            const f = historia.frases[i];
            const num = i + 1;
            const tonoFrase = f.tono || historia.tono || 'Desconocido';
            const color = this._getColorTono(tonoFrase);
            const hanzi = f.hanzi || f.original || '';
            const pinyin = f.pinyin || '';
            const traduccion = f.traduccion || '';
            
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;box-shadow:var(--shadow);border-left:6px solid ${color};">
                    <div style="display:flex;gap:8px;align-items:start;">
                        <span style="font-size:12px;font-weight:600;color:var(--gray-light);min-width:28px;">${num}.</span>
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                <span style="font-size:36px;font-weight:800;color:var(--dark);line-height:1.6;letter-spacing:3px;">${hanzi}</span>
                                <span style="font-size:18px;color:${color};font-weight:700;background:${color}15;padding:4px 16px;border-radius:14px;border:2px solid ${color}50;">🎵 ${tonoFrase}</span>
                            </div>
                            ${pinyin ? `<div style="font-size:18px;color:var(--primary);margin-top:4px;letter-spacing:1.5px;font-weight:500;padding:4px 14px;background:var(--primary)08;border-radius:8px;display:inline-block;border:1px solid var(--primary)30;">🔊 ${pinyin}</div>` : ''}
                            ${!ocultarTraduccion ? `
                                <div style="font-size:16px;color:var(--gray);margin-top:6px;">→ ${traduccion}</div>
                            ` : `
                                <div style="font-size:12px;color:var(--warning);margin-top:6px;padding:4px 12px;background:var(--warning)08;border-radius:6px;display:inline-block;border:1px dashed var(--warning);">
                                    🔒 Traducción oculta
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        
        html += `
            <div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap;padding:12px 0;border-top:2px solid var(--light);">
                <button class="btn-primary" onclick="window.UITonos._estudiarHistoriaVisor()" style="padding:8px 24px;font-size:14px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;">
                    <i class="fas fa-play"></i> Estudiar esta historia
                </button>
                <button class="btn-secondary" onclick="window.UITonos._cerrarVisor()" style="padding:8px 24px;font-size:14px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
            </div>
        `;
        
        html += '</div>';
        container.innerHTML = html;
    }

    // ============================================================
    // RENDERIZAR SIN DICCIONARIO
    // ============================================================

    _renderizarSinDiccionario() {
        return `
            <div style="text-align:center;padding:60px 20px;background:var(--bg);border-radius:12px;border:2px dashed var(--primary);">
                <div style="font-size:64px;margin-bottom:16px;">📚</div>
                <h3 style="font-size:22px;font-weight:700;color:var(--dark);">No hay diccionario tonal cargado</h3>
                <p style="font-size:16px;color:var(--gray);max-width:500px;margin:8px auto;">
                    Genera el diccionario completo usando el botón <strong>"Generar con IA"</strong>.
                </p>
                <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                    <button class="btn-primary" onclick="window.UITonos._importarDiccionarioJSON()" 
                            style="padding:12px 30px;font-size:16px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:10px;cursor:pointer;">
                        <i class="fas fa-file-import"></i> Generar con IA
                    </button>
                    <button class="btn-secondary" onclick="window.UITonos._exportarDiccionarioJSON()" 
                            style="padding:12px 30px;font-size:16px;background:var(--bg);border:1px solid var(--light);border-radius:10px;cursor:pointer;opacity:0.5;cursor:not-allowed;" disabled>
                        <i class="fas fa-file-export"></i> Exportar JSON
                    </button>
                </div>
                <p style="font-size:12px;color:var(--gray-light);margin-top:12px;">
                    💡 El diccionario se guardará automáticamente para futuras sesiones.
                </p>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR HEADER
    // ============================================================

    _renderizarHeader(nombreIdioma, totalHistorias, totalGrupos) {
        const esTonal = this._esTonal(this._idiomaActual);
        const totalSilabas = Object.keys(this._diccionario).length;
        
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:16px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                <div>
                    <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                        🎵 Estudio de Tonos <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                        ${esTonal ? '<span style="font-size:11px;font-weight:400;color:var(--success);margin-left:8px;">🔊 Tonal</span>' : ''}
                        <span style="font-size:10px;color:var(--info);margin-left:8px;">💾 ${totalHistorias} historias</span>
                        <span style="font-size:10px;color:var(--gray-light);margin-left:8px;">📚 ${totalSilabas} sílabas</span>
                    </h2>
                    <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                        Nivel <strong>${this._nivelUsuario}</strong> · ${totalGrupos} grupos disponibles
                        <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">📖 ${this._historiasLeidas.size} leídas</span>
                        ${this._grupoActual ? `<span style="font-size:11px;color:var(--primary);margin-left:8px;">📌 Grupo: <strong>${this._grupoActual}</strong></span>` : ''}
                    </p>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.uiCore.volverDashboard()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                        <i class="fas fa-home"></i> Dashboard
                    </button>
                    ${this._grupoActual ? `
                        <button class="btn-primary" onclick="window.UITonos._generarHistoriaJSON()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-magic"></i> Generar Historia (8-10 líneas)
                        </button>
                        <button class="btn-success" onclick="window.UITonos._guardarTodasHistorias()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-save"></i> Guardar Todo
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="window.UITonos._toggleOcultarTraduccion()" style="padding:6px 14px;font-size:12px;background:${this._visorOcultarTraduccion ? 'var(--warning)' : 'var(--bg)'};color:${this._visorOcultarTraduccion ? 'var(--dark)' : 'var(--gray)'};border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                        ${this._visorOcultarTraduccion ? '👁️ Mostrar' : '🔒 Ocultar'}
                    </button>
                    <button class="btn-danger" onclick="window.UITonos._limpiarHistorias()" style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR BOTONES DE DICCIONARIO
    // ============================================================

    _renderizarBotonesDiccionario() {
        const totalSilabas = Object.keys(this._diccionario).length;
        
        return `
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;padding:10px 16px;background:var(--bg);border-radius:10px;border:1px solid var(--light);align-items:center;">
                <span style="font-size:12px;font-weight:600;color:var(--dark);">📚 Diccionario:</span>
                <span style="font-size:12px;color:var(--gray-light);">${totalSilabas} sílabas</span>
                <button class="btn-primary" onclick="window.UITonos._importarDiccionarioJSON()" 
                        style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                    <i class="fas fa-file-import"></i> Generar con IA
                </button>
                <button class="btn-secondary" onclick="window.UITonos._exportarDiccionarioJSON()" 
                        style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                    <i class="fas fa-file-export"></i> Exportar JSON
                </button>
                <span style="font-size:10px;color:var(--gray-light);margin-left:4px;">
                    💡 "Generar con IA" muestra el prompt para enviar a la IA externa
                </span>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR FILTROS
    // ============================================================

    _renderizarFiltros() {
        return `
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;padding:12px 16px;background:var(--white);border-radius:10px;border:1px solid var(--light);">
                <div style="flex:1;min-width:140px;position:relative;">
                    <i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray);font-size:12px;"></i>
                    <input type="text" id="buscarTonosInput" placeholder="🔍 Buscar sílaba..." 
                           value="${this._busqueda}" 
                           style="width:100%;padding:6px 10px 6px 30px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);"
                           oninput="window.UITonos._buscarGrupos(this.value)">
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <span style="font-size:11px;color:var(--gray);">Nivel:</span>
                    <select id="nivelFiltro" onchange="window.UITonos._filtrarPorNivel(this.value)" 
                            style="padding:6px 10px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);background:var(--white);">
                        <option value="A1" ${this._nivelUsuario === 'A1' ? 'selected' : ''}>A1</option>
                        <option value="A2" ${this._nivelUsuario === 'A2' ? 'selected' : ''}>A2</option>
                        <option value="B1" ${this._nivelUsuario === 'B1' ? 'selected' : ''}>B1</option>
                        <option value="B2" ${this._nivelUsuario === 'B2' ? 'selected' : ''}>B2</option>
                        <option value="C1" ${this._nivelUsuario === 'C1' ? 'selected' : ''}>C1</option>
                        <option value="C2" ${this._nivelUsuario === 'C2' ? 'selected' : ''}>C2</option>
                    </select>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR ESTADÍSTICAS
    // ============================================================

    _renderizarEstadisticas(idiomaActivo) {
        let totalHistorias = 0;
        for (const g in this._todasLasHistorias) {
            totalHistorias += (this._todasLasHistorias[g] || []).length;
        }
        const totalGuardadas = Object.keys(this._historiasGuardadas).filter(function(k) { return this._historiasGuardadas[k]; }.bind(this)).length;
        const totalSilabas = Object.keys(this._diccionario).length;
        
        return `
            <div style="margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--gray);">
                <span>📚 ${totalSilabas} sílabas</span>
                <span>🎯 ${Object.keys(this._diccionario).length} grupos</span>
                <span>📝 ${totalHistorias} historias totales</span>
                <span>⭐ ${totalGuardadas} guardadas</span>
                <span>📖 ${this._historiasLeidas.size} leídas</span>
                <span>🎯 Nivel ${this._nivelUsuario}</span>
                <span>🔊 ${this._getNombreIdioma(idiomaActivo)} es tonal</span>
                <span>🌍 ${idiomaActivo}</span>
                <span>💾 ${Object.keys(this._todasLasHistorias).filter(g => (this._todasLasHistorias[g] || []).length > 0).length} grupos con historias</span>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR NO TONAL
    // ============================================================

    _renderizarNoTonal(nombreIdioma) {
        return `
            <div style="text-align:center;padding:60px 20px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                <div style="font-size:64px;margin-bottom:16px;">🎵</div>
                <h3 style="font-size:20px;font-weight:700;color:var(--dark);">El idioma <strong>${nombreIdioma}</strong> no es tonal</h3>
                <p style="font-size:14px;color:var(--gray-light);">El estudio de tonos está diseñado para idiomas tonales como Chino, Tailandés o Vietnamita.</p>
                <button class="btn-primary" onclick="window.uiCore.volverDashboard()" style="margin-top:12px;padding:8px 20px;">
                    <i class="fas fa-arrow-left"></i> Volver al Dashboard
                </button>
            </div>
        `;
    }

    // ============================================================
    // FILTRADO Y NAVEGACIÓN
    // ============================================================

    _filtrarGrupos(grupos) {
        let resultado = grupos.slice();
        
        if (this._busqueda) {
            const busquedaLower = this._busqueda.toLowerCase();
            resultado = resultado.filter(function(g) {
                return g.includes(busquedaLower) || 
                       Object.values(this._diccionario[g]?.tonos || {}).some(function(t) {
                           return t.caracter.includes(busquedaLower) || 
                                  t.significado.toLowerCase().includes(busquedaLower);
                       }.bind(this));
            }.bind(this));
        }
        
        return resultado;
    }

    _buscarGrupos(valor) {
        this._busqueda = valor.trim();
        this._paginaActual = 1;
        this._renderizarPanel();
    }

    _filtrarPorNivel(valor) {
        this._nivelUsuario = valor;
        this._paginaActual = 1;
        this._renderizarPanel();
        const core = this._obtenerCore();
        if (core) core.mostrarToast(`🎯 Nivel cambiado a: ${valor}`, 'info');
    }

    _limpiarFiltros() {
        this._busqueda = '';
        this._paginaActual = 1;
        const input = document.getElementById('buscarTonosInput');
        if (input) input.value = '';
        this._renderizarPanel();
    }

    _irPagina(pagina) {
        const grupos = this._filtrarGrupos(Object.keys(this._getGruposPorNivel()));
        const total = grupos.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._itemsPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaActual = pagina;
        this._renderizarPanel();
    }

    _irPaginaHistorias(pagina) {
        const total = this._historiasGrupo.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._historiasPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaHistorias = pagina;
        this._renderizarPanel();
    }

    _toggleOcultarTraduccion() {
        this._visorOcultarTraduccion = !this._visorOcultarTraduccion;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        const core = this._obtenerCore();
        if (core) {
            core.mostrarToast(
                this._visorOcultarTraduccion ? '🔒 Traducción oculta' : '👁️ Traducción visible',
                'info'
            );
        }
    }

    // ============================================================
    // SELECCIONAR GRUPO
    // ============================================================

    _seleccionarGrupo(grupo) {
        if (!this._diccionario[grupo]) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Grupo no encontrado', 'error');
            return;
        }
        
        if (this._grupoActual && this._historiasGrupo.length > 0) {
            this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;
        }
        
        this._grupoActual = grupo;
        this._grupoData = this._diccionario[grupo];
        
        if (this._todasLasHistorias[grupo]) {
            this._historiasGrupo = this._todasLasHistorias[grupo];
        } else {
            this._historiasGrupo = [];
            this._todasLasHistorias[grupo] = [];
        }
        
        this._paginaHistorias = 1;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
    }

    _cerrarGrupo() {
        if (this._grupoActual && this._historiasGrupo.length > 0) {
            this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;
        }
        
        this._grupoActual = null;
        this._grupoData = null;
        this._historiasGrupo = [];
        this._paginaHistorias = 1;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
    }

    // ============================================================
    // TOGGLE HISTORIA LEÍDA
    // ============================================================

    _toggleHistoriaLeida(idx, checked) {
        if (!this._grupoActual) return;
        const key = 'historia_' + this._grupoActual + '_' + idx;
        if (checked) {
            this._historiasLeidas.add(key);
        } else {
            this._historiasLeidas.delete(key);
        }
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        const core = this._obtenerCore();
        if (core) {
            core.mostrarToast(
                checked ? '✅ Historia marcada como leída' : '↩️ Historia desmarcada como leída',
                checked ? 'success' : 'info'
            );
        }
    }

    // ============================================================
    // TOGGLE HISTORIA COMPLETADA
    // ============================================================

    async _toggleHistoriaCompletada(idx, checked) {
        if (!this._grupoActual) return;
        const historia = this._historiasGrupo[idx];
        if (!historia) return;

        historia.completada = checked;
        
        if (checked && historia.id) {
            const frases = await db.obtenerFrasesPorHistoria(historia.id);
            for (let i = 0; i < frases.length; i++) {
                const progreso = await db.obtenerProgreso(frases[i].id);
                if (progreso) {
                    progreso.rcn = 5.0;
                    progreso.estado = 'completada';
                    await db.guardarProgreso(progreso);
                }
            }
        }
        
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        const core = this._obtenerCore();
        if (core) {
            core.mostrarToast(
                checked ? '✅ Historia completada' : '🔄 Historia desmarcada como completada',
                checked ? 'success' : 'info'
            );
        }
    }

    // ============================================================
    // GUARDAR HISTORIA
    // ============================================================

    async _guardarHistoria(idx) {
        if (!this._grupoActual) return;
        const historia = this._historiasGrupo[idx];
        if (!historia) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        const key = 'historia_' + this._grupoActual + '_' + idx;
        if (this._historiasGuardadas[key]) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('ℹ️ Esta historia ya está guardada', 'info');
            return;
        }

        const core = this._obtenerCore();
        if (core) core.mostrarToast('💾 Guardando historia...', 'info');

        try {
            const idioma = this._idiomaActual || 'zh';
            const nivel = this._nivelUsuario;
            const titulo = historia.titulo || 'Historia de tonos - ' + this._grupoActual;

            const historiaObj = {
                titulo: titulo,
                idioma: idioma,
                nivel: nivel,
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                frases: (historia.frases || []).length,
                _esTono: true,
                _grupoSilaba: this._grupoActual,
                _tono: historia.tono || 'Desconocido',
                _continuaDe: idx > 0 ? this._historiasGrupo[idx - 1]?.titulo : null,
                _numLineas: historia.frases ? historia.frases.length : 0
            };

            const historiaId = await db.guardarHistoria(historiaObj);

            if (historiaId) {
                let frasesGuardadas = 0;
                if (historia.frases) {
                    for (let i = 0; i < historia.frases.length; i++) {
                        const f = historia.frases[i];
                        if (!f.hanzi && !f.original) continue;
                        
                        const fraseObj = {
                            original: f.hanzi || f.original || '',
                            traduccion: f.traduccion || '',
                            historiaId: historiaId,
                            idioma: idioma,
                            nivel: nivel,
                            esJeroglifico: true,
                            pinyinCompleto: f.pinyin || '',
                            reglaGramatical: 'Tono: ' + (f.tono || 'Desconocido'),
                            tipoRegla: 'tono',
                            familiaSemantica: 'Historias tonales - ' + this._grupoActual,
                            palabras: [],
                            activa: true,
                            rg: 0,
                            rcn: 0,
                            _esTono: true,
                            _tono: f.tono || 'Desconocido',
                            _grupoSilaba: this._grupoActual
                        };
                        
                        const id = await db.guardarFrase(fraseObj);
                        if (id) frasesGuardadas++;
                    }
                }

                await db.update('historias', {
                    ...historiaObj,
                    id: historiaId,
                    frases: frasesGuardadas
                });

                this._historiasGuardadas[key] = true;
                this._historiasGrupo[idx].id = historiaId;
                
                this._guardarEstadoCompleto();
                this._renderizarPanel();
                
                if (core) {
                    core.mostrarToast('✅ Historia "' + titulo + '" (8-10 líneas) guardada', 'success');
                }
            }

        } catch (error) {
            console.error('❌ Error guardando historia:', error);
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GUARDAR TODAS LAS HISTORIAS DEL GRUPO
    // ============================================================

    async _guardarTodasHistorias() {
        if (!this._grupoActual) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Selecciona un grupo primero', 'error');
            return;
        }
        
        let guardadas = 0;
        let yaGuardadas = 0;

        for (let i = 0; i < this._historiasGrupo.length; i++) {
            const key = 'historia_' + this._grupoActual + '_' + i;
            if (this._historiasGuardadas[key]) {
                yaGuardadas++;
                continue;
            }
            try {
                await this._guardarHistoria(i);
                guardadas++;
            } catch (e) {
                console.warn('⚠️ Error guardando historia ' + i, e);
            }
        }

        const core = this._obtenerCore();
        if (core) {
            core.mostrarToast(
                '✅ ' + guardadas + ' historias guardadas' + (yaGuardadas > 0 ? ', ' + yaGuardadas + ' ya existentes' : ''),
                'success'
            );
        }
    }

    // ============================================================
    // ELIMINAR HISTORIA
    // ============================================================

    async _eliminarHistoria(idx) {
        if (!this._grupoActual) return;
        const historia = this._historiasGrupo[idx];
        if (!historia) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        const core = this._obtenerCore();
        const confirmar = await core?.confirm(
            '⚠️ ¿Eliminar la historia "' + (historia.titulo || 'Sin título') + '"?\n\nEsta acción NO se puede deshacer.',
            '🗑️ Eliminar Historia'
        );

        if (!confirmar) return;

        try {
            if (historia.id) {
                const frases = await db.obtenerFrasesPorHistoria(historia.id);
                for (let i = 0; i < frases.length; i++) {
                    await db.delete('frases', frases[i].id);
                }
                await db.delete('historias', historia.id);
            }

            this._historiasGrupo.splice(idx, 1);
            this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;
            
            const nuevasGuardadas = {};
            const nuevasLeidas = new Set();
            for (let j = 0; j < this._historiasGrupo.length; j++) {
                const oldKey = 'historia_' + this._grupoActual + '_' + (j >= idx ? j + 1 : j);
                const newKey = 'historia_' + this._grupoActual + '_' + j;
                if (this._historiasGuardadas[oldKey]) {
                    nuevasGuardadas[newKey] = true;
                }
                if (this._historiasLeidas.has(oldKey)) {
                    nuevasLeidas.add(newKey);
                }
            }
            for (const key in this._historiasGuardadas) {
                if (key.startsWith('historia_' + this._grupoActual + '_')) {
                    if (!nuevasGuardadas[key]) {
                        delete this._historiasGuardadas[key];
                    }
                }
            }
            for (const key2 in nuevasGuardadas) {
                this._historiasGuardadas[key2] = true;
            }
            for (const key3 of nuevasLeidas) {
                this._historiasLeidas.add(key3);
            }

            this._guardarEstadoCompleto();
            this._renderizarPanel();
            
            if (core) {
                core.mostrarToast('🗑️ Historia eliminada', 'warning');
            }

        } catch (error) {
            console.error('❌ Error eliminando historia:', error);
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Error al eliminar la historia', 'error');
        }
    }

    // ============================================================
    // LIMPIAR TODAS LAS HISTORIAS
    // ============================================================

    _limpiarHistorias() {
        let total = 0;
        for (const g in this._todasLasHistorias) {
            total += (this._todasLasHistorias[g] || []).length;
        }
        
        const core = this._obtenerCore();
        const confirmar = core?.confirm(
            '🧹 ¿Limpiar TODAS las historias de TODOS los grupos?\n\nSe eliminarán ' + total + ' historias.\n\n⚠️ Esta acción NO se puede deshacer.',
            '🧹 Limpiar Todas las Historias'
        );
        
        if (!confirmar) return;
        
        for (const g in this._todasLasHistorias) {
            const historias = this._todasLasHistorias[g] || [];
            for (let i = 0; i < historias.length; i++) {
                const h = historias[i];
                if (h.id) {
                    try {
                        db.obtenerFrasesPorHistoria(h.id).then(function(frases) {
                            for (let fi = 0; fi < frases.length; fi++) {
                                db.delete('frases', frases[fi].id);
                            }
                            db.delete('historias', h.id);
                        });
                    } catch (e) {
                        console.warn('⚠️ Error eliminando historia:', e);
                    }
                }
            }
        }
        
        this._todasLasHistorias = {};
        this._historiasGrupo = [];
        this._historiasGuardadas = {};
        this._historiasLeidas = new Set();
        this._paginaHistorias = 1;
        
        if (this._grupoActual) {
            this._todasLasHistorias[this._grupoActual] = [];
            this._historiasGrupo = [];
        }
        
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        
        if (core) {
            core.mostrarToast('🧹 Todas las historias limpiadas', 'success');
        }
    }

    // ============================================================
    // LEER HISTORIA COMPLETA
    // ============================================================

    _leerHistoriaCompleta(idx) {
        if (!this._grupoActual) return;
        const historia = this._historiasGrupo[idx];
        if (!historia || !historia.frases || historia.frases.length === 0) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Esta historia no tiene frases', 'error');
            return;
        }

        this._historiaActual = {
            grupo: this._grupoActual,
            idx: idx,
            titulo: historia.titulo || 'Historia de tonos',
            frases: historia.frases,
            tono: historia.tono || 'Desconocido',
            id: historia.id,
            numLineas: historia.frases.length
        };
        
        this._visorAbierto = true;
        this._renderizarVisor();
    }

    // ============================================================
    // ESTUDIAR HISTORIA COMPLETA
    // ============================================================

    async _estudiarHistoriaCompleta(idx) {
        if (!this._grupoActual) return;
        const historia = this._historiasGrupo[idx];
        if (!historia || !historia.frases || historia.frases.length === 0) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Esta historia no tiene frases', 'error');
            return;
        }

        try {
            const frasesParaEstudiar = historia.frases.map((f, i) => {
                return {
                    id: `tono_${this._grupoActual}_${idx}_${i}`,
                    original: f.hanzi || f.original || '',
                    traduccion: f.traduccion || '',
                    pinyinCompleto: f.pinyin || '',
                    esJeroglifico: true,
                    idioma: this._idiomaActual || 'zh',
                    nivel: this._nivelUsuario,
                    _esTono: true,
                    _tono: f.tono || historia.tono || 'Desconocido',
                    _grupoSilaba: this._grupoActual,
                    _historiaTitulo: historia.titulo || 'Historia de tonos',
                    _historiaIdx: idx,
                    progreso: null
                };
            });

            if (frasesParaEstudiar.length === 0) {
                const core = this._obtenerCore();
                if (core) core.mostrarToast('❌ No se encontraron frases para estudiar', 'error');
                return;
            }

            if (window.pipeline) {
                window.pipeline.frases = frasesParaEstudiar;
                window.pipeline.indiceFrase = 0;
                await window.pipeline.cargarFrase(0);
                window.pipeline._estudiandoHistoria = true;
                window.pipeline._historiaIdActual = `tono_${this._grupoActual}_${idx}`;
                window.pipeline._origenHistoria = 'tonos';
                
                const core = this._obtenerCore();
                if (core) {
                    core.irAModulo('study');
                    core.mostrarToast(`📖 Estudiando: "${historia.titulo || 'Historia de tonos'}" (${frasesParaEstudiar.length} frases)`, 'success');
                    
                    setTimeout(() => {
                        this._inyectarBotonVolverTonos();
                    }, 300);
                }
            } else {
                const core = this._obtenerCore();
                if (core) core.mostrarToast('❌ Pipeline no disponible', 'error');
            }

        } catch (error) {
            console.error('❌ Error estudiando historia:', error);
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Error al estudiar la historia', 'error');
        }
    }

    // ============================================================
    // CERRAR VISOR
    // ============================================================

    _cerrarVisor() {
        this._visorAbierto = false;
        this._historiaActual = null;
        this._renderizarPanel();
    }

    // ============================================================
    // ESTUDIAR HISTORIA DESDE VISOR
    // ============================================================

    async _estudiarHistoriaVisor() {
        if (!this._historiaActual) {
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ No hay historia para estudiar', 'error');
            return;
        }
        
        const idx = this._historiaActual.idx;
        this._cerrarVisor();
        await this._estudiarHistoriaCompleta(idx);
    }

    // ============================================================
    // TOGGLE VISOR TRADUCCIÓN
    // ============================================================

    _toggleVisorTraduccion(checked) {
        this._visorOcultarTraduccion = checked;
        this._guardarEstadoCompleto();
        this._renderizarVisor();
        const core = this._obtenerCore();
        if (core) {
            core.mostrarToast(
                checked ? '🔒 Traducción oculta' : '👁️ Traducción visible',
                'info'
            );
        }
    }

    // ============================================================
    // INYECTAR BOTÓN VOLVER A TONOS
    // ============================================================

    _inyectarBotonVolverTonos() {
        if (this._botonInyectado) return;
        
        const header = document.querySelector('#studyModule .module-header');
        if (!header) {
            setTimeout(() => this._inyectarBotonVolverTonos(), 300);
            return;
        }
        
        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = 'none';
        }
        
        if (document.getElementById('btnVolverTonos')) {
            this._botonInyectado = true;
            return;
        }
        
        const titleDiv = header.querySelector('.module-title');
        if (!titleDiv) {
            const btn = document.createElement('button');
            btn.id = 'btnVolverTonos';
            btn.className = 'btn-primary';
            btn.style.cssText = 'padding: 6px 16px;font-size: 12px;background: linear-gradient(135deg, #FDCB6E, #E17055);color: white;border: none;border-radius: 6px;cursor: pointer;transition: all 0.3s ease;margin-left: 12px;font-weight: 600;';
            btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Tonos';
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._volverAlModoTonos();
            };
            header.appendChild(btn);
            this._botonInyectado = true;
            return;
        }
        
        const btn2 = document.createElement('button');
        btn2.id = 'btnVolverTonos';
        btn2.className = 'btn-primary';
        btn2.style.cssText = 'padding: 6px 16px;font-size: 12px;background: linear-gradient(135deg, #FDCB6E, #E17055);color: white;border: none;border-radius: 6px;cursor: pointer;transition: all 0.3s ease;margin-left: 12px;font-weight: 600;';
        btn2.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Tonos';
        btn2.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._volverAlModoTonos();
        };
        
        titleDiv.appendChild(btn2);
        this._botonInyectado = true;
        console.log('✅ Botón "Volver a Tonos" inyectado');
    }

    // ============================================================
    // VOLVER AL MODO TONOS
    // ============================================================

    async _volverAlModoTonos() {
        console.log('🔄 Volviendo al Modo Tonos...');
        
        try {
            if (window.pipeline) {
                window.pipeline._estudiandoHistoria = false;
                window.pipeline._historiaIdActual = null;
                window.pipeline._origenHistoria = null;
                window.pipeline._grupoSilaba = null;
                window.pipeline._historiaIdx = null;
            }
            
            const btnVolver = document.getElementById('btnVolverTonos');
            if (btnVolver) btnVolver.remove();
            
            const btnLibro = document.getElementById('btnLibroLectura');
            if (btnLibro) btnLibro.style.display = '';
            
            this._botonInyectado = false;
            
            const core = this._obtenerCore();
            if (core) {
                core.irAModulo('tonos');
                setTimeout(() => {
                    this._renderizarPanel();
                    core?.mostrarToast('🔄 Volviendo a Tonos', 'info');
                }, 300);
            }
            
        } catch (error) {
            console.error('❌ Error en _volverAlModoTonos:', error);
            const core = this._obtenerCore();
            if (core) core.mostrarToast('❌ Error al volver al Modo Tonos', 'error');
        }
    }

    // ============================================================
    // DESTRUIR
    // ============================================================

    destroy() {
        if (this._grupoActual && this._historiasGrupo.length > 0) {
            this._todasLasHistorias[this._grupoActual] = this._historiasGrupo;
        }
        this._guardarEstadoCompleto();
        this._initDone = false;
        console.log('🛑 UI Tonos v17.6 - Destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UITonos = new UITonos();

console.log('🎵 UI Estudio de Tonos v17.6 - PROMPT POR NIVEL');
console.log('  📌 PROMPT MODIFICADO: "Genera SOLO las sílabas del nivel X"');
console.log('  📌 Límite de 20-50 sílabas para evitar respuestas gigantes');
console.log('  ✅ Todas las funcionalidades originales preservadas');