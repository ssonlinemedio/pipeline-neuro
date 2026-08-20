// ============================================================
// UI ESTUDIO DE TONOS v7.5 - COMPLETO CON ELIMINAR Y OCULTAR TRADUCCIÓN
// ============================================================

class UITonos {
    constructor() {
        this._core = null;
        this._container = null;
        this._initDone = false;
        this._caracterActual = null;
        this._tonosData = null;
        this._historiasGeneradas = [];
        this._historiaActual = null;
        this._historiaVisor = null;
        this._visorAbierto = false;
        this._visorOcultarTraduccion = false;
        this._modoVista = 'panel';
        this._paginaActual = 1;
        this._itemsPorPagina = 12;
        this._paginaHistorias = 1;
        this._historiasPorPagina = 3;
        this._generando = false;
        this._importando = false;
        this._tonosCache = {};
        this._historiasGuardadas = {};
        this._historiasLeidas = new Set();
        this._ocultarTraduccion = false;
        this._cargandoCaracteres = false;
        this._caracteresRaizCache = null;
        this._ultimaCargaCaracteres = 0;
        this._tiempoCacheCaracteres = 30000;
        this._familiaSeleccionada = 'todas';
        this._busqueda = '';
        this._persistenciaKey = 'pipeline_tonos_estado_v7';
        this._historiaEnEstudio = null;
        this._estudiandoHistoriaCompleta = false;
        this._botonInyectado = false;
        
        this.TONOS = ['mā', 'má', 'mǎ', 'mà', 'ma'];
        this.TONOS_DESCRIPCION = {
            'mā': '1er tono (alto y nivel)',
            'má': '2º tono (ascendente)',
            'mǎ': '3er tono (descendente-ascendente)',
            'mà': '4º tono (descendente)',
            'ma': 'Tono neutro'
        };
        this.TONOS_COLORES = {
            'mā': '#6C5CE7',
            'má': '#00B894',
            'mǎ': '#FDCB6E',
            'mà': '#E17055',
            'ma': '#636E72'
        };
        
        this._IDIOMAS_TONALES = ['zh', 'chino', 'chinese', 'mandarin', 'mandarín', 'th', 'tailandés', 'thai', 'vi', 'vietnamita', 'vietnamese'];
        
        // DICCIONARIO DE PALABRAS COMUNES EN CHINO
        this._DICCIONARIO = {
            '我们': 'wǒmen', '你们': 'nǐmen', '他们': 'tāmen', '她们': 'tāmen',
            '大家': 'dàjiā', '自己': 'zìjǐ', '别人': 'biérén', '朋友': 'péngyou',
            '家人': 'jiārén', '老师': 'lǎoshī', '学生': 'xuésheng', '医生': 'yīshēng',
            '警察': 'jǐngchá', '工人': 'gōngrén', '农民': 'nóngmín',
            '中国人': 'zhōngguórén', '外国人': 'wàiguórén',
            '学习': 'xuéxí', '工作': 'gōngzuò', '生活': 'shēnghuó',
            '睡觉': 'shuìjiào', '起床': 'qǐchuáng', '吃饭': 'chīfàn',
            '喝水': 'hēshuǐ', '看书': 'kànshū', '写字': 'xiězì',
            '说话': 'shuōhuà', '走路': 'zǒulù', '跑步': 'pǎobù',
            '游泳': 'yóuyǒng', '唱歌': 'chànggē', '跳舞': 'tiàowǔ',
            '旅行': 'lǚxíng', '购物': 'gòuwù', '做饭': 'zuòfàn',
            '打扫': 'dǎsǎo', '休息': 'xiūxi', '等待': 'děngdài',
            '忍耐': 'rěnnài', '学校': 'xuéxiào', '医院': 'yīyuàn',
            '商店': 'shāngdiàn', '市场': 'shìchǎng', '银行': 'yínháng',
            '邮局': 'yóujú', '餐厅': 'cāntīng', '咖啡': 'kāfēi',
            '咖啡店': 'kāfēidiàn', '公园': 'gōngyuán', '广场': 'guǎngchǎng',
            '图书馆': 'túshūguǎn', '电影院': 'diànyǐngyuàn',
            '火车站': 'huǒchēzhàn', '飞机场': 'fēijīchǎng',
            '房子': 'fángzi', '房间': 'fángjiān', '桌子': 'zhuōzi',
            '椅子': 'yǐzi', '门': 'mén', '窗': 'chuāng',
            '窗户': 'chuānghu', '书': 'shū', '笔': 'bǐ',
            '纸': 'zhǐ', '电脑': 'diànnǎo', '手机': 'shǒujī',
            '电视': 'diànshì', '米饭': 'mǐfàn', '面条': 'miàntiáo',
            '面包': 'miànbāo', '苹果': 'píngguǒ', '香蕉': 'xiāngjiāo',
            '橘子': 'júzi', '西瓜': 'xīguā', '葡萄': 'pútáo',
            '草莓': 'cǎoméi', '茶': 'chá', '牛奶': 'niúnǎi',
            '果汁': 'guǒzhī', '啤酒': 'píjiǔ', '葡萄酒': 'pútáojiǔ',
            '水': 'shuǐ', '漂亮': 'piàoliang', '美丽': 'měilì',
            '英俊': 'yīngjùn', '聪明': 'cōngming', '勇敢': 'yǒnggǎn',
            '善良': 'shànliáng', '诚实': 'chéngshí', '友好': 'yǒuhǎo',
            '快乐': 'kuàilè', '高兴': 'gāoxìng', '难过': 'nánguò',
            '生气': 'shēngqì', '害怕': 'hàipà', '紧张': 'jǐnzhāng',
            '放松': 'fàngsōng', '温暖': 'wēnnuǎn', '寒冷': 'hánlěng',
            '因为': 'yīnwèi', '所以': 'suǒyǐ', '但是': 'dànshì',
            '虽然': 'suīrán', '如果': 'rúguǒ', '那么': 'nàme',
            '而且': 'érqiě', '或者': 'huòzhě', '的': 'de',
            '了': 'le', '吗': 'ma', '呢': 'ne', '吧': 'ba',
            '啊': 'a', '今天': 'jīntiān', '明天': 'míngtiān',
            '昨天': 'zuótiān', '现在': 'xiànzài', '以后': 'yǐhòu',
            '以前': 'yǐqián', '早上': 'zǎoshang', '中午': 'zhōngwǔ',
            '晚上': 'wǎnshang', '年': 'nián', '月': 'yuè',
            '日': 'rì', '时': 'shí', '分': 'fēn', '秒': 'miǎo',
            '中国': 'zhōngguó', '北京': 'běijīng', '上海': 'shànghǎi',
            '广州': 'guǎngzhōu', '深圳': 'shēnzhèn', '香港': 'xiānggǎng',
            '台湾': 'táiwān', '澳门': 'àomén', '美国': 'měiguó',
            '英国': 'yīngguó', '法国': 'fàguó', '德国': 'déguó',
            '日本': 'rìběn', '韩国': 'hánguó', '新加坡': 'xīnjiāpō',
            '谢谢': 'xièxie', '不客气': 'bùkèqì', '对不起': 'duìbuqǐ',
            '没关系': 'méiguānxi', '你好': 'nǐhǎo', '您好': 'nínhǎo',
            '再见': 'zàijiàn', '欢迎': 'huānyíng', '早上好': 'zǎoshanghǎo',
            '晚上好': 'wǎnshanghǎo', '晚安': 'wǎn\'ān',
            '可以': 'kěyǐ', '应该': 'yīnggāi', '必须': 'bìxū',
            '可能': 'kěnéng', '想要': 'xiǎngyào',
            '非常': 'fēicháng', '特别': 'tèbié', '一起': 'yīqǐ',
            '一下': 'yīxià', '一点': 'yīdiǎn', '一些': 'yīxiē'
        };
        
        this._FAMILIAS_SEMANTICAS = [
            { id: 'familia', nombre: '👨‍👩‍👧‍👦 Familia', caracteres: ['爸', '妈', '哥', '妹', '爷', '奶', '姐', '弟', '叔', '姨'] },
            { id: 'numeros', nombre: '🔢 Números', caracteres: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万'] },
            { id: 'personas', nombre: '👤 Personas', caracteres: ['你', '我', '他', '她', '们', '人', '民', '众', '君', '臣'] },
            { id: 'profesiones', nombre: '💼 Profesiones', caracteres: ['医', '生', '师', '教', '学', '工', '农', '商', '军', '警'] },
            { id: 'cuerpo', nombre: '🧠 Cuerpo', caracteres: ['头', '手', '脚', '眼', '耳', '鼻', '口', '心', '身', '体'] },
            { id: 'naturaleza', nombre: '🌿 Naturaleza', caracteres: ['山', '水', '火', '木', '金', '土', '日', '月', '星', '风'] },
            { id: 'comida', nombre: '🍜 Comida', caracteres: ['米', '面', '肉', '菜', '果', '茶', '酒', '饭', '汤', '油'] },
            { id: 'casa', nombre: '🏠 Casa', caracteres: ['房', '门', '窗', '墙', '桌', '椅', '床', '灯', '水', '电'] },
            { id: 'colores', nombre: '🎨 Colores', caracteres: ['红', '黄', '蓝', '绿', '白', '黑', '灰', '紫', '粉', '橙'] },
            { id: 'verbos', nombre: '🏃 Verbos', caracteres: ['走', '跑', '跳', '坐', '站', '看', '听', '说', '吃', '喝'] },
            { id: 'adjetivos', nombre: '📝 Adjetivos', caracteres: ['大', '小', '多', '少', '高', '矮', '胖', '瘦', '美', '丑'] },
            { id: 'tiempo', nombre: '⏰ Tiempo', caracteres: ['年', '月', '日', '时', '分', '秒', '早', '晚', '春', '秋'] }
        ];
        
        this._familiaMap = {};
        for (const familia of this._FAMILIAS_SEMANTICAS) {
            for (const c of familia.caracteres) {
                this._familiaMap[c] = familia.id;
            }
        }
        
        this._cargarEstadoCompleto();
    }

    // ============================================================
    // PERSISTENCIA
    // ============================================================

    _cargarEstadoCompleto() {
        try {
            const data = localStorage.getItem(this._persistenciaKey);
            if (data) {
                const parsed = JSON.parse(data);
                this._historiasGeneradas = parsed.historiasGeneradas || [];
                this._historiasGuardadas = parsed.historiasGuardadas || {};
                this._historiasLeidas = new Set(parsed.historiasLeidas || []);
                this._ocultarTraduccion = parsed.ocultarTraduccion || false;
                this._visorOcultarTraduccion = parsed.visorOcultarTraduccion || false;
                this._caracterActual = parsed.caracterActual || null;
                this._historiaActual = parsed.historiaActual || null;
                if (parsed.tonosData) {
                    this._tonosData = parsed.tonosData;
                }
                console.log(`💾 Estado de Tonos restaurado: ${this._historiasGeneradas.length} historias, ${this._historiasLeidas.size} leídas`);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando estado de Tonos:', e);
        }
    }

    _guardarEstadoCompleto() {
        try {
            const data = {
                historiasGeneradas: this._historiasGeneradas,
                historiasGuardadas: this._historiasGuardadas,
                historiasLeidas: Array.from(this._historiasLeidas),
                ocultarTraduccion: this._ocultarTraduccion,
                visorOcultarTraduccion: this._visorOcultarTraduccion,
                caracterActual: this._caracterActual,
                historiaActual: this._historiaActual,
                tonosData: this._tonosData,
                version: '7.5',
                timestamp: Date.now()
            };
            localStorage.setItem(this._persistenciaKey, JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ Error guardando estado de Tonos:', e);
        }
    }

    // ============================================================
    // SEGMENTACIÓN SEMÁNTICA
    // ============================================================

    _segmentarFrase(hanzi, pinyin) {
        if (!hanzi) return { segmentos: [], pinyinSegmentos: [], esPalabra: [] };

        if (pinyin && pinyin.includes(' ')) {
            const pinyinPalabras = pinyin.split(/\s+/);
            const resultado = this._segmentarConPinyinYDiccionario(hanzi, pinyinPalabras);
            if (resultado.segmentos.length > 0) {
                return resultado;
            }
        }
        return this._segmentarPorDiccionario(hanzi);
    }

    _segmentarConPinyinYDiccionario(hanzi, pinyinPalabras) {
        const segmentos = [];
        const pinyinSegmentos = [];
        const esPalabra = [];

        let i = 0;
        let pIdx = 0;

        while (i < hanzi.length && pIdx < pinyinPalabras.length) {
            if (i + 2 < hanzi.length) {
                const tres = hanzi.substring(i, i + 3);
                if (this._DICCIONARIO[tres]) {
                    segmentos.push(tres);
                    pinyinSegmentos.push(pinyinPalabras[pIdx] || this._DICCIONARIO[tres]);
                    esPalabra.push(true);
                    i += 3;
                    pIdx++;
                    continue;
                }
            }

            if (i + 1 < hanzi.length) {
                const dos = hanzi.substring(i, i + 2);
                if (this._DICCIONARIO[dos]) {
                    segmentos.push(dos);
                    pinyinSegmentos.push(pinyinPalabras[pIdx] || this._DICCIONARIO[dos]);
                    esPalabra.push(true);
                    i += 2;
                    pIdx++;
                    continue;
                }
            }

            segmentos.push(hanzi[i]);
            if (pIdx < pinyinPalabras.length) {
                pinyinSegmentos.push(pinyinPalabras[pIdx]);
            } else {
                pinyinSegmentos.push('');
            }
            esPalabra.push(false);
            i++;
            pIdx++;
        }

        while (i < hanzi.length) {
            segmentos.push(hanzi[i]);
            pinyinSegmentos.push('');
            esPalabra.push(false);
            i++;
        }

        return { segmentos, pinyinSegmentos, esPalabra };
    }

    _segmentarPorDiccionario(hanzi) {
        const segmentos = [];
        const pinyinSegmentos = [];
        const esPalabra = [];

        let i = 0;
        while (i < hanzi.length) {
            if (i + 2 < hanzi.length) {
                const tres = hanzi.substring(i, i + 3);
                if (this._DICCIONARIO[tres]) {
                    segmentos.push(tres);
                    pinyinSegmentos.push(this._DICCIONARIO[tres]);
                    esPalabra.push(true);
                    i += 3;
                    continue;
                }
            }

            if (i + 1 < hanzi.length) {
                const dos = hanzi.substring(i, i + 2);
                if (this._DICCIONARIO[dos]) {
                    segmentos.push(dos);
                    pinyinSegmentos.push(this._DICCIONARIO[dos]);
                    esPalabra.push(true);
                    i += 2;
                    continue;
                }
            }

            segmentos.push(hanzi[i]);
            pinyinSegmentos.push('');
            esPalabra.push(false);
            i++;
        }

        return { segmentos, pinyinSegmentos, esPalabra };
    }

    _renderizarFraseSegmentada(hanzi, pinyin, tono) {
        const { segmentos, pinyinSegmentos, esPalabra } = this._segmentarFrase(hanzi, pinyin);
        const tonoColor = this._getColorTono(tono);
        const caracterTono = this._caracterActual || '';
        
        let html = `<div style="display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;padding:6px 0;">`;
        
        for (let i = 0; i < segmentos.length; i++) {
            const seg = segmentos[i];
            const py = pinyinSegmentos[i] || '';
            const esPal = esPalabra[i] || false;
            const contieneTono = seg.includes(caracterTono);
            
            const bgColor = contieneTono ? `${tonoColor}25` : (esPal ? `${tonoColor}10` : 'transparent');
            const borderColor = contieneTono ? `${tonoColor}50` : (esPal ? `${tonoColor}25` : 'none');
            const borderWidth = contieneTono ? '2px' : (esPal ? '1px' : '0px');
            const fontWeight = contieneTono ? '700' : (esPal ? '600' : '400');
            const textColor = contieneTono ? tonoColor : (esPal ? 'var(--dark)' : 'var(--dark)');
            const fontSize = segmentos.length > 8 ? '20px' : '24px';
            const pinyinSize = '14px';
            const esPalabraMultiple = seg.length >= 2;
            const padding = esPalabraMultiple ? '4px 14px' : '2px 10px';
            const borderRadius = esPalabraMultiple ? '10px' : '6px';
            
            html += `
                <span style="
                    display:inline-flex;
                    flex-direction:column;
                    align-items:center;
                    padding:${padding};
                    border-radius:${borderRadius};
                    background:${bgColor};
                    border:${borderWidth} solid ${borderColor};
                    cursor:default;
                    transition:all 0.2s;
                    ${esPalabraMultiple ? 'box-shadow: 0 1px 6px rgba(0,0,0,0.06);' : ''}
                ">
                    <span style="font-size:${fontSize};font-weight:${fontWeight};color:${textColor};${esPalabraMultiple ? 'letter-spacing:0.5px;' : ''}">${seg}</span>
                    ${py ? `<span style="font-size:${pinyinSize};color:${contieneTono ? tonoColor : 'var(--gray-light)'};letter-spacing:0.5px;margin-top:2px;font-weight:${contieneTono ? '600' : '400'};">${py}</span>` : ''}
                    ${esPalabraMultiple && !contieneTono ? `<span style="font-size:8px;color:var(--gray-light);margin-top:1px;opacity:0.6;">${seg.length} car.</span>` : ''}
                </span>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _esTonal(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_TONALES.some(item =>
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

    _obtenerNivelRealUsuario() {
        try {
            const infoActivo = window.gestorIdiomas?.getInfoActivo?.();
            if (infoActivo?.nivel) return infoActivo.nivel;
            const usuarioLocal = localStorage.getItem('pipeline_usuario');
            if (usuarioLocal) {
                const parsed = JSON.parse(usuarioLocal);
                const idiomaActivo = window.gestorIdiomas?.getIdiomaActivo?.() || 'zh';
                const idiomaObj = parsed.idiomasObjetivo?.find(i => i.idioma === idiomaActivo);
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

    _getColorTono(tono) {
        return this.TONOS_COLORES[tono] || 'var(--gray)';
    }

    _getFamiliaCaracter(caracter) {
        return this._familiaMap[caracter] || 'otras';
    }

    _getNombreFamilia(familiaId) {
        const f = this._FAMILIAS_SEMANTICAS.find(f => f.id === familiaId);
        return f ? f.nombre : '📂 Otras';
    }

    // ============================================================
    // OBTENER CARACTERES RAÍZ
    // ============================================================

    async _obtenerCaracteresRaiz(idioma) {
        if (this._caracteresRaizCache && 
            this._ultimaCargaCaracteres > 0 && 
            (Date.now() - this._ultimaCargaCaracteres) < this._tiempoCacheCaracteres) {
            return this._caracteresRaizCache;
        }

        if (this._cargandoCaracteres) {
            await new Promise(resolve => {
                const check = () => {
                    if (!this._cargandoCaracteres) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
            return this._caracteresRaizCache || this._generarCaracteresEjemplo();
        }

        this._cargandoCaracteres = true;
        
        try {
            let palabras = [];
            
            if (db && typeof db.obtenerPalabrasPorIdioma === 'function') {
                try {
                    const resultado = await db.obtenerPalabrasPorIdioma(idioma);
                    if (Array.isArray(resultado) && resultado.length > 0) {
                        palabras = resultado;
                    }
                } catch (e) {
                    console.warn('⚠️ Error en db.obtenerPalabrasPorIdioma:', e);
                }
            }
            
            if (palabras.length === 0 && db && typeof db.obtenerFamiliasCaracteres === 'function') {
                try {
                    const familias = await db.obtenerFamiliasCaracteres(idioma);
                    if (Array.isArray(familias) && familias.length > 0) {
                        for (const f of familias) {
                            if (f.caracterRaiz) {
                                palabras.push(f.caracterRaiz);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error en db.obtenerFamiliasCaracteres:', e);
                }
            }
            
            if (palabras.length === 0) {
                const ejemplos = this._generarCaracteresEjemplo();
                this._caracteresRaizCache = ejemplos;
                this._ultimaCargaCaracteres = Date.now();
                return ejemplos;
            }
            
            const caracteresRaiz = palabras.filter(p => 
                p.esCaracterRaiz === true || 
                (p.palabra && p.palabra.length === 1) ||
                (p.hanzi && p.hanzi.length === 1)
            );
            
            if (caracteresRaiz.length === 0) {
                const palabrasCortas = palabras.filter(p => 
                    (p.palabra && p.palabra.length === 1) || 
                    (p.hanzi && p.hanzi.length === 1)
                );
                if (palabrasCortas.length > 0) {
                    this._caracteresRaizCache = palabrasCortas;
                    this._ultimaCargaCaracteres = Date.now();
                    return palabrasCortas;
                }
                const ejemplos = this._generarCaracteresEjemplo();
                this._caracteresRaizCache = ejemplos;
                this._ultimaCargaCaracteres = Date.now();
                return ejemplos;
            }
            
            for (const c of caracteresRaiz) {
                const palabra = c.palabra || c.hanzi || '';
                c._familia = this._getFamiliaCaracter(palabra);
                c._familiaNombre = this._getNombreFamilia(c._familia);
            }
            
            this._caracteresRaizCache = caracteresRaiz;
            this._ultimaCargaCaracteres = Date.now();
            return caracteresRaiz;
            
        } catch (error) {
            console.error('❌ Error obteniendo caracteres raíz:', error);
            const ejemplos = this._generarCaracteresEjemplo();
            this._caracteresRaizCache = ejemplos;
            this._ultimaCargaCaracteres = Date.now();
            return ejemplos;
        } finally {
            this._cargandoCaracteres = false;
        }
    }

    _generarCaracteresEjemplo() {
        return [
            { palabra: '妈', pinyin: 'mā', significado: 'mamá', esCaracterRaiz: true, tonos: ['mā', 'má', 'mǎ', 'mà', 'ma'], _familia: 'familia' },
            { palabra: '爸', pinyin: 'bà', significado: 'papá', esCaracterRaiz: true, tonos: ['bā', 'bá', 'bǎ', 'bà'], _familia: 'familia' },
            { palabra: '哥', pinyin: 'gē', significado: 'hermano mayor', esCaracterRaiz: true, tonos: ['gē', 'gé', 'gě', 'gè'], _familia: 'familia' },
            { palabra: '妹', pinyin: 'mèi', significado: 'hermana menor', esCaracterRaiz: true, tonos: ['mēi', 'méi', 'měi', 'mèi'], _familia: 'familia' },
            { palabra: '你', pinyin: 'nǐ', significado: 'tú', esCaracterRaiz: true, tonos: ['nī', 'ní', 'nǐ', 'nì'], _familia: 'personas' },
            { palabra: '我', pinyin: 'wǒ', significado: 'yo', esCaracterRaiz: true, tonos: ['wō', 'wó', 'wǒ', 'wò'], _familia: 'personas' },
            { palabra: '他', pinyin: 'tā', significado: 'él', esCaracterRaiz: true, tonos: ['tā', 'tá', 'tǎ', 'tà'], _familia: 'personas' }
        ];
    }

    // ============================================================
    // OBTENER DATOS DE TONOS
    // ============================================================

    _obtenerDatosTonos(caracter, pinyin, significado) {
        if (this._tonosCache[caracter]) {
            return this._tonosCache[caracter];
        }

        const tonos = {};
        const caracteresRaiz = this._caracteresRaizCache || this._generarCaracteresEjemplo();
        const caracterObj = caracteresRaiz.find(c => c.palabra === caracter || c.hanzi === caracter);
        
        if (caracterObj && caracterObj.tonos) {
            for (const t of caracterObj.tonos) {
                tonos[t] = {
                    caracter: caracter,
                    pinyin: t,
                    significado: significado || caracter,
                    traduccion: this.TONOS_DESCRIPCION[t] || ''
                };
            }
        } else {
            const tonosBase = this.TONOS;
            for (const t of tonosBase) {
                tonos[t] = {
                    caracter: caracter,
                    pinyin: t,
                    significado: significado || caracter,
                    traduccion: this.TONOS_DESCRIPCION[t] || ''
                };
            }
        }

        const result = {
            caracter: caracter,
            pinyin: pinyin || '',
            significado: significado || '',
            tonos: tonos
        };

        this._tonosCache[caracter] = result;
        return result;
    }

    _tieneTonos(caracter) {
        const data = this._obtenerDatosTonos(caracter.palabra, caracter.pinyin || '', caracter.significado || '');
        return data && Object.keys(data.tonos || {}).length > 0;
    }

    _contarTonos(caracter) {
        const data = this._obtenerDatosTonos(caracter.palabra, caracter.pinyin || '', caracter.significado || '');
        return data ? Object.keys(data.tonos || {}).length : 0;
    }

    // ============================================================
    // FILTRAR CARACTERES
    // ============================================================

    _filtrarCaracteres(caracteres) {
        let resultado = [...caracteres];
        
        if (this._busqueda) {
            const busquedaLower = this._busqueda.toLowerCase();
            resultado = resultado.filter(c => {
                const palabra = c.palabra || c.hanzi || '';
                const significado = c.significado || '';
                const pinyin = c.pinyin || '';
                return palabra.includes(busquedaLower) || 
                       significado.toLowerCase().includes(busquedaLower) ||
                       pinyin.includes(busquedaLower);
            });
        }
        
        if (this._familiaSeleccionada !== 'todas') {
            resultado = resultado.filter(c => {
                const familia = c._familia || this._getFamiliaCaracter(c.palabra || c.hanzi || '');
                return familia === this._familiaSeleccionada;
            });
        }
        
        return resultado;
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        this._initDone = true;
        console.log('🎵 UI Tonos v7.5: Inicializado (con eliminar y ocultar traducción)');
        return this;
    }

    cargar(core) {
        this._core = core || this._core;
        this._renderizarPanel();
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL
    // ============================================================

    async _renderizarPanel() {
        const container = this._getContainer();
        if (!container) {
            console.warn('⚠️ Container no encontrado para Tonos');
            return;
        }

        if (this._visorAbierto) {
            return;
        }

        if (this._historiasGeneradas.length === 0 && this._caracterActual) {
            const savedState = localStorage.getItem(this._persistenciaKey);
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed.historiasGeneradas && parsed.historiasGeneradas.length > 0) {
                        this._historiasGeneradas = parsed.historiasGeneradas;
                        this._historiasGuardadas = parsed.historiasGuardadas || {};
                        console.log(`💾 Restauradas ${this._historiasGeneradas.length} historias`);
                    }
                } catch (e) {}
            }
        }

        const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'zh';
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const nivelActual = this._obtenerNivelRealUsuario();
        const esTonal = this._esTonal(idiomaActivo);

        if (!esTonal) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                    <div style="font-size:64px;margin-bottom:16px;">🎵</div>
                    <h3 style="font-size:20px;font-weight:700;color:var(--dark);">El idioma <strong>${nombreIdioma}</strong> no es tonal</h3>
                    <p style="font-size:14px;color:var(--gray-light);">
                        El estudio de tonos está diseñado para idiomas tonales como Chino, Tailandés o Vietnamita.
                    </p>
                    <button class="btn-primary" onclick="window.uiCore.volverDashboard()" style="margin-top:12px;">
                        <i class="fas fa-arrow-left"></i> Volver al Dashboard
                    </button>
                </div>
            `;
            return;
        }

        const caracteresRaiz = await this._obtenerCaracteresRaiz(idiomaActivo);
        const caracteresFiltrados = this._filtrarCaracteres(caracteresRaiz);

        let html = `
            <div class="tonos-container" style="padding:16px;">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            🎵 Estudio de Tonos
                            <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                            <span style="font-size:11px;font-weight:400;color:var(--success);margin-left:8px;">🔊 Tonal</span>
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            Nivel <strong>${nivelActual}</strong> · 
                            ${caracteresRaiz.length} caracteres raíz disponibles
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">📖 ${this._historiasLeidas.size} leídas</span>
                            <span style="font-size:11px;color:var(--primary);margin-left:8px;">💾 ${this._historiasGeneradas.length} historias</span>
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.uiCore.volverDashboard()" 
                                style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-home"></i> Dashboard
                        </button>
                        <button class="btn-primary" onclick="window.UITonos._seleccionarCaracter()" 
                                style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-search"></i> Seleccionar Carácter
                        </button>
                        <button class="btn-success" onclick="window.UITonos._generarHistoriaTonos()" 
                                style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-file-export"></i> Generar JSON
                        </button>
                        <button class="btn-secondary" onclick="window.UITonos._toggleOcultarTraduccion()" 
                                style="padding:6px 14px;font-size:12px;background:${this._ocultarTraduccion ? 'var(--warning)' : 'var(--bg)'};color:${this._ocultarTraduccion ? 'var(--dark)' : 'var(--gray)'};border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            ${this._ocultarTraduccion ? '👁️ Mostrar traducción' : '🔒 Ocultar traducción'}
                        </button>
                        ${this._historiasGeneradas.length > 0 ? `
                            <button class="btn-danger" onclick="window.UITonos._limpiarHistorias()" 
                                    style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;">
                                <i class="fas fa-trash"></i> Limpiar Todo
                            </button>
                        ` : ''}
                    </div>
                </div>
        `;

        if (this._caracterActual && this._tonosData) {
            html += this._renderizarEstudioTonos();
        } else {
            html += this._renderizarSeleccionCaracter(caracteresFiltrados, caracteresRaiz);
        }

        const estadisticas = this._calcularEstadisticas();
        html += `
                <div style="margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--gray);">
                    <span>🎵 ${estadisticas.totalCaracteres} caracteres raíz</span>
                    <span>📝 ${estadisticas.totalHistorias} historias</span>
                    <span>⭐ ${estadisticas.totalGuardadas} guardadas</span>
                    <span>📖 ${this._historiasLeidas.size} leídas</span>
                    <span>🎯 Nivel ${estadisticas.nivelPromedio}</span>
                    <span>🔊 ${this._getNombreIdioma(idiomaActivo)} es tonal</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // ============================================================
    // RENDERIZAR SELECCIÓN DE CARÁCTER
    // ============================================================

    _renderizarSeleccionCaracter(caracteresFiltrados, caracteresRaiz) {
        if (!caracteresRaiz || caracteresRaiz.length === 0) {
            return `
                <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                    <div style="font-size:48px;margin-bottom:16px;">🀄</div>
                    <p style="font-size:16px;font-weight:500;">No hay caracteres raíz disponibles</p>
                    <p style="font-size:13px;color:var(--gray-light);">
                        Importa o genera contenido en el módulo <strong>Caracteres</strong> primero.
                    </p>
                    <button class="btn-primary" onclick="window.uiCore.irAModulo('caracteres')" style="margin-top:12px;padding:8px 20px;">
                        <i class="fas fa-arrow-right"></i> Ir a Caracteres
                    </button>
                    <button class="btn-secondary" onclick="window.UITonos._usarCaracteresEjemplo()" 
                            style="margin-top:12px;padding:8px 20px;margin-left:8px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-lightbulb"></i> Usar Ejemplos
                    </button>
                </div>
            `;
        }

        const totalItems = caracteresFiltrados.length;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / this._itemsPorPagina));
        if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
        if (this._paginaActual < 1) this._paginaActual = 1;
        
        const inicio = (this._paginaActual - 1) * this._itemsPorPagina;
        const fin = Math.min(inicio + this._itemsPorPagina, totalItems);
        const itemsPagina = caracteresFiltrados.slice(inicio, fin);

        const familiasDisponibles = new Set();
        for (const c of caracteresRaiz) {
            const palabra = c.palabra || c.hanzi || '';
            const familia = c._familia || this._getFamiliaCaracter(palabra);
            if (familia && familia !== 'otras') {
                familiasDisponibles.add(familia);
            }
        }

        let html = `
            <div style="background:var(--white);border-radius:12px;padding:16px 20px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                        🀄 Selecciona un carácter raíz para estudiar sus tonos
                        <span style="font-size:12px;font-weight:400;color:var(--gray-light);">(${totalItems} caracteres)</span>
                    </h3>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <div style="position:relative;">
                            <i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray);font-size:12px;"></i>
                            <input type="text" id="buscarTonosInput" 
                                   placeholder="🔍 Buscar..." 
                                   value="${this._busqueda}"
                                   style="padding:6px 10px 6px 30px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);width:140px;"
                                   oninput="window.UITonos._buscarCaracteres(this.value)">
                        </div>
                        
                        <select id="familiaFiltro" onchange="window.UITonos._filtrarPorFamilia(this.value)"
                                style="padding:6px 10px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);background:var(--white);">
                            <option value="todas">📂 Todas las familias</option>
                            ${Array.from(familiasDisponibles).sort().map(f => {
                                const nombre = this._getNombreFamilia(f);
                                return `<option value="${f}" ${this._familiaSeleccionada === f ? 'selected' : ''}>${nombre}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;">
                    ${itemsPagina.map(c => {
                        const tieneTonos = this._tieneTonos(c);
                        const tonosCount = this._contarTonos(c);
                        const palabra = c.palabra || c.hanzi || '?';
                        const pinyin = c.pinyin || '';
                        const significado = c.significado || palabra;
                        const familia = c._familiaNombre || this._getNombreFamilia(c._familia || this._getFamiliaCaracter(palabra));
                        
                        return `
                            <div style="background:${tieneTonos ? 'var(--bg)' : 'var(--bg)'};border-radius:10px;padding:10px 12px;border:2px solid ${tieneTonos ? 'var(--success)' : 'var(--light)'};cursor:pointer;transition:all 0.3s;"
                                 onclick="window.UITonos._seleccionarCaracterEspecifico('${palabra}', '${pinyin}', '${significado}')"
                                 onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 2px 16px rgba(0,0,0,0.1)'" 
                                 onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-size:28px;font-weight:700;color:var(--dark);">${palabra}</span>
                                    ${tieneTonos ? `<span style="font-size:11px;color:var(--success);">✅ ${tonosCount}</span>` : `<span style="font-size:11px;color:var(--gray-light);">⚠️</span>`}
                                </div>
                                <div style="font-size:12px;color:var(--gray);">${significado}</div>
                                ${pinyin ? `<div style="font-size:11px;color:var(--gray-light);">🔊 ${pinyin}</div>` : ''}
                                <div style="font-size:9px;color:var(--gray-light);margin-top:2px;">${familia}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${totalPaginas > 1 ? `
                    <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UITonos._irPagina(${this._paginaActual - 1})" style="padding:4px 12px;font-size:11px;${this._paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaActual <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span style="font-size:12px;color:var(--gray);">${this._paginaActual} / ${totalPaginas}</span>
                        <button class="btn-secondary" onclick="window.UITonos._irPagina(${this._paginaActual + 1})" style="padding:4px 12px;font-size:11px;${this._paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaActual >= totalPaginas ? 'disabled' : ''}>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                ` : ''}
                
                <div style="margin-top:8px;font-size:10px;color:var(--gray-light);text-align:center;">
                    💡 Los caracteres con ✅ tienen datos de tonos. Haz clic para estudiarlos.
                    ${this._busqueda ? ` · 🔎 ${totalItems} resultados para "${this._busqueda}"` : ''}
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // FILTROS Y BÚSQUEDA
    // ============================================================

    _buscarCaracteres(valor) {
        this._busqueda = valor.trim();
        this._paginaActual = 1;
        this._renderizarPanel();
    }

    _filtrarPorFamilia(valor) {
        this._familiaSeleccionada = valor;
        this._paginaActual = 1;
        this._renderizarPanel();
    }

    _irPagina(pagina) {
        if (pagina < 1) return;
        this._paginaActual = pagina;
        this._renderizarPanel();
    }

    // ============================================================
    // TOGGLE OCULTAR TRADUCCIÓN
    // ============================================================

    _toggleOcultarTraduccion() {
        this._ocultarTraduccion = !this._ocultarTraduccion;
        try {
            localStorage.setItem('pipeline_tonos_ocultar_traduccion', String(this._ocultarTraduccion));
            this._guardarEstadoCompleto();
        } catch (e) {}
        this._renderizarPanel();
        this._core?.mostrarToast(
            this._ocultarTraduccion ? '🔒 Traducción oculta' : '👁️ Traducción visible',
            'info'
        );
    }

    // ============================================================
    // RENDERIZAR ESTUDIO DE TONOS - CON ELIMINAR Y OCULTAR TRADUCCIÓN
    // ============================================================

    _renderizarEstudioTonos() {
        const caracter = this._caracterActual;
        const tonosData = this._tonosData;
        const historias = this._historiasGeneradas;
        const idiomaNativo = this._obtenerIdiomaNativo();

        const totalHistorias = historias.length;
        const totalPaginasHistorias = Math.max(1, Math.ceil(totalHistorias / this._historiasPorPagina));
        if (this._paginaHistorias > totalPaginasHistorias) this._paginaHistorias = totalPaginasHistorias;
        if (this._paginaHistorias < 1) this._paginaHistorias = 1;
        
        const inicioHistorias = (this._paginaHistorias - 1) * this._historiasPorPagina;
        const finHistorias = Math.min(inicioHistorias + this._historiasPorPagina, totalHistorias);
        const historiasPagina = historias.slice(inicioHistorias, finHistorias);

        const totalLeidas = historias.filter((_, idx) => this._historiasLeidas.has(`historia_${idx}`)).length;

        let html = `
            <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:48px;font-weight:800;color:var(--dark);">${caracter}</span>
                        <div>
                            <div style="font-size:16px;font-weight:600;color:var(--dark);">${caracter} - Diferentes tonos</div>
                            <div style="font-size:12px;color:var(--gray);">${tonosData.significado || 'Significado base'}</div>
                            <div style="font-size:10px;color:var(--gray-light);">💾 ${historias.length} historias</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UITonos._cambiarCaracter()" 
                                style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                            <i class="fas fa-undo"></i> Cambiar
                        </button>
                        <button class="btn-primary" onclick="window.UITonos._generarHistoriaTonos()" 
                                style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-magic"></i> Generar Historia
                        </button>
                        <button class="btn-success" onclick="window.UITonos._guardarTodasHistorias()" 
                                style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-save"></i> Guardar Todas
                        </button>
                        <button class="btn-secondary" onclick="window.UITonos._toggleOcultarTraduccion()" 
                                style="padding:4px 14px;font-size:11px;background:${this._ocultarTraduccion ? 'var(--warning)' : 'var(--bg)'};border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                            ${this._ocultarTraduccion ? '🔒' : '👁️'}
                        </button>
                    </div>
                </div>

                <!-- TONOS CON TRADUCCIÓN -->
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:16px;">
                    ${Object.entries(tonosData.tonos || {}).map(([tono, info]) => `
                        <div style="background:var(--bg);border-radius:8px;padding:8px 12px;text-align:center;border:2px solid ${this._getColorTono(tono)};">
                            <div style="font-size:24px;font-weight:700;color:${this._getColorTono(tono)};">${info.caracter || '?'}</div>
                            <div style="font-size:14px;color:var(--gray-light);">${tono}</div>
                            <div style="font-size:10px;color:var(--gray);">${info.traduccion || this.TONOS_DESCRIPCION[tono] || ''}</div>
                            <div style="font-size:9px;color:var(--gray-light);margin-top:2px;">${info.significado || caracter}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- HISTORIAS CON BOTÓN ELIMINAR -->
                ${historias.length > 0 ? `
                    <div style="margin-top:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <h4 style="font-size:14px;font-weight:600;color:var(--dark);margin:0;">
                                    📖 Historias generadas (${historias.length})
                                </h4>
                                <span style="font-size:10px;color:var(--success);">✅ ${totalLeidas} leídas</span>
                                ${totalPaginasHistorias > 1 ? `<span style="font-size:10px;color:var(--gray-light);">· Página ${this._paginaHistorias}/${totalPaginasHistorias}</span>` : ''}
                            </div>
                            <div style="display:flex;gap:6px;">
                                ${totalPaginasHistorias > 1 ? `
                                    <button class="btn-secondary" onclick="window.UITonos._irPaginaHistorias(${this._paginaHistorias - 1})" 
                                            style="padding:2px 10px;font-size:10px;${this._paginaHistorias <= 1 ? 'opacity:0.5;cursor:default;' : ''}" 
                                            ${this._paginaHistorias <= 1 ? 'disabled' : ''}>
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <span style="font-size:11px;color:var(--gray);">${this._paginaHistorias}/${totalPaginasHistorias}</span>
                                    <button class="btn-secondary" onclick="window.UITonos._irPaginaHistorias(${this._paginaHistorias + 1})" 
                                            style="padding:2px 10px;font-size:10px;${this._paginaHistorias >= totalPaginasHistorias ? 'opacity:0.5;cursor:default;' : ''}" 
                                            ${this._paginaHistorias >= totalPaginasHistorias ? 'disabled' : ''}>
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px;">
                            ${historiasPagina.map((historia, idx) => {
                                const globalIdx = inicioHistorias + idx;
                                const esGuardada = this._historiasGuardadas[globalIdx] === true;
                                const esLeida = this._historiasLeidas.has(`historia_${globalIdx}`);
                                const tonoColor = this._getColorTono(historia.tono);
                                const completada = historia.completada || false;
                                
                                const tituloColor = completada ? 'var(--success)' : tonoColor;
                                const tituloIcon = completada ? '✅' : '📖';
                                const tituloMostrar = historia.titulo || `Historia de tonos - ${this._caracterActual}`;
                                
                                return `
                                    <div style="background:${esLeida ? 'var(--success)04' : 'var(--bg)'};border-radius:10px;padding:12px 16px;border:2px solid ${completada ? 'var(--success)' : (esLeida ? 'var(--success)' : 'var(--light)')};display:flex;flex-direction:column;gap:6px;cursor:pointer;" 
                                         onclick="window.UITonos._estudiarHistoriaCompleta(${globalIdx})"
                                         onmouseover="this.style.borderColor='var(--primary)'" 
                                         onmouseout="this.style.borderColor='${completada ? 'var(--success)' : (esLeida ? 'var(--success)' : 'var(--light)')}'">
                                        
                                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                                            <div style="display:flex;align-items:center;gap:10px;">
                                                <span style="font-size:18px;font-weight:700;color:${tituloColor};">${tituloIcon} ${tituloMostrar}</span>
                                                ${historia.tono ? `<span style="font-size:11px;color:${tonoColor};font-weight:600;background:${tonoColor}10;padding:2px 12px;border-radius:12px;">🎵 ${historia.tono}</span>` : ''}
                                                ${completada ? '<span style="font-size:10px;color:var(--success);font-weight:600;">✅ Completada</span>' : ''}
                                                ${esLeida ? '<span style="font-size:10px;color:var(--info);font-weight:600;">📖 Leída</span>' : ''}
                                                ${esGuardada ? '<span style="font-size:10px;color:var(--success);font-weight:600;">⭐ Guardada</span>' : ''}
                                            </div>
                                            <span style="font-size:11px;color:var(--gray-light);">${historia.frases?.length || 0} frases</span>
                                        </div>
                                        
                                        <div style="font-size:12px;color:var(--gray-light);padding-left:10px;border-left:2px solid ${tituloColor};">
                                            ${historia.resumen || 'Sin resumen disponible'}
                                        </div>
                                        
                                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;border-top:1px solid var(--light);padding-top:6px;margin-top:2px;">
                                            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                                                <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${completada ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${completada ? 'var(--success)' : 'var(--light)'};"
                                                       onclick="event.stopPropagation();">
                                                    <input type="checkbox" ${completada ? 'checked' : ''} 
                                                           onchange="window.UITonos._toggleHistoriaCompletada(${globalIdx}, this.checked)"
                                                           style="margin:0;width:12px;height:12px;cursor:pointer;">
                                                    <span style="color:${completada ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${completada ? '✅' : '⬜'}</span>
                                                    <span style="font-size:7px;color:var(--gray-light);">Completada</span>
                                                </label>
                                                
                                                <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${esLeida ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};"
                                                       onclick="event.stopPropagation();">
                                                    <input type="checkbox" ${esLeida ? 'checked' : ''} 
                                                           onchange="window.UITonos._toggleHistoriaLeida(${globalIdx}, this.checked)"
                                                           style="margin:0;width:12px;height:12px;cursor:pointer;">
                                                    <span style="color:${esLeida ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${esLeida ? '✅' : '⬜'}</span>
                                                    <span style="font-size:7px;color:var(--gray-light);">Leída</span>
                                                </label>
                                            </div>
                                            <div style="display:flex;gap:4px;">
                                                ${!esGuardada ? `
                                                    <button onclick="event.stopPropagation();window.UITonos._guardarHistoria(${globalIdx})" 
                                                            style="padding:2px 12px;font-size:10px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                        <i class="fas fa-save"></i> Guardar
                                                    </button>
                                                ` : ''}
                                                <button onclick="event.stopPropagation();window.UITonos._leerHistoriaCompleta(${globalIdx})" 
                                                        style="padding:2px 12px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                    <i class="fas fa-book"></i> Leer
                                                </button>
                                                <button onclick="event.stopPropagation();window.UITonos._estudiarHistoriaCompleta(${globalIdx})" 
                                                        style="padding:2px 12px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                    <i class="fas fa-play"></i> Estudiar
                                                </button>
                                                <!-- 🔥 BOTÓN ELIMINAR -->
                                                <button onclick="event.stopPropagation();window.UITonos._eliminarHistoria(${globalIdx})" 
                                                        style="padding:2px 12px;font-size:10px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;"
                                                        title="Eliminar esta historia">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div style="text-align:center;padding:30px;color:var(--gray-light);background:var(--bg);border-radius:8px;border:2px dashed var(--light);">
                        <div style="font-size:48px;margin-bottom:12px;">📖</div>
                        <p style="font-size:15px;font-weight:500;">No hay historias generadas para este carácter.</p>
                        <p style="font-size:13px;">Usa el botón <strong>"Generar Historia"</strong> para crear una historia de 8-10 líneas que use todos los tonos.</p>
                    </div>
                `}
            </div>
        `;

        return html;
    }

    // ============================================================
    // PAGINACIÓN DE HISTORIAS
    // ============================================================

    _irPaginaHistorias(pagina) {
        const totalHistorias = this._historiasGeneradas.length;
        const totalPaginas = Math.max(1, Math.ceil(totalHistorias / this._historiasPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaHistorias = pagina;
        this._renderizarPanel();
    }

    // ============================================================
    // TOGGLE HISTORIA LEÍDA
    // ============================================================

    _toggleHistoriaLeida(idx, checked) {
        const key = `historia_${idx}`;
        if (checked) {
            this._historiasLeidas.add(key);
        } else {
            this._historiasLeidas.delete(key);
        }
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        this._core?.mostrarToast(
            checked ? '✅ Historia marcada como leída' : '↩️ Historia desmarcada como leída',
            checked ? 'success' : 'info'
        );
    }

    // ============================================================
    // TOGGLE HISTORIA COMPLETADA (CON RESET DE RCN)
    // ============================================================

    async _toggleHistoriaCompletada(idx, checked) {
        const historia = this._historiasGeneradas[idx];
        if (!historia) return;

        if (checked) {
            historia.completada = true;
            this._core?.mostrarToast('✅ Historia marcada como completada', 'success');
            
            if (historia.id) {
                const frases = await db.obtenerFrasesPorHistoria(historia.id);
                for (const f of frases) {
                    try {
                        const progreso = await db.obtenerProgreso(f.id);
                        if (progreso) {
                            progreso.rcn = 5.0;
                            progreso.estado = 'completada';
                            progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 5;
                            await db.guardarProgreso(progreso);
                        } else {
                            const nuevoProgreso = {
                                id: f.id,
                                tipo: 'frase',
                                rcn: 5.0,
                                estado: 'completada',
                                fase: 2,
                                repasosExitosos: 5,
                                repasosFallidos: 0,
                                ultimoRepaso: Date.now(),
                                fechaCreacion: Date.now()
                            };
                            await db.guardarProgreso(nuevoProgreso);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error marcando frase como completada:', e);
                    }
                }
                
                const historiaDB = await db.get('historias', historia.id);
                if (historiaDB) {
                    historiaDB.estado = 'completada';
                    historiaDB._completada = true;
                    historiaDB._fechaCompletado = Date.now();
                    historiaDB._rcnPromedio = 5.0;
                    await db.update('historias', historiaDB);
                }
            }
        } else {
            historia.completada = false;
            if (historia.id) {
                const frases = await db.obtenerFrasesPorHistoria(historia.id);
                for (const f of frases) {
                    try {
                        const progreso = await db.obtenerProgreso(f.id);
                        if (progreso) {
                            progreso.rcn = 0;
                            progreso.estado = 'en_curso';
                            progreso.repasosExitosos = 0;
                            progreso.repasosFallidos = 0;
                            await db.guardarProgreso(progreso);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error resetando RCN:', e);
                    }
                }
                
                const historiaDB = await db.get('historias', historia.id);
                if (historiaDB) {
                    historiaDB.estado = 'en_curso';
                    historiaDB._completada = false;
                    historiaDB._rcnPromedio = 0;
                    delete historiaDB._fechaCompletado;
                    await db.update('historias', historiaDB);
                }
            }
            this._core?.mostrarToast('🔄 RCN reseteado. Puedes volver a estudiar la historia.', 'info');
        }
        
        this._guardarEstadoCompleto();
        this._renderizarPanel();
    }

    // ============================================================
    // 🔥 ELIMINAR HISTORIA INDIVIDUAL
    // ============================================================

    async _eliminarHistoria(idx) {
        const historia = this._historiasGeneradas[idx];
        if (!historia) {
            this._core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        const confirmar = await this._core?.confirm(
            `⚠️ ¿Eliminar la historia "${historia.titulo || 'Sin título'}"?\n\n` +
            `Se eliminarán todas las frases asociadas.\n\n` +
            `Esta acción NO se puede deshacer.\n\n¿Continuar?`,
            '🗑️ Eliminar Historia'
        );

        if (!confirmar) return;

        try {
            // Eliminar de la base de datos si está guardada
            if (historia.id) {
                // Obtener frases de la historia
                const frases = await db.obtenerFrasesPorHistoria(historia.id);
                for (const f of frases) {
                    await db.delete('frases', f.id);
                }
                await db.delete('historias', historia.id);
                console.log(`🗑️ Historia "${historia.titulo}" eliminada de la DB`);
            }

            // Eliminar del array
            this._historiasGeneradas.splice(idx, 1);
            
            // Reindexar las historias guardadas y leídas
            const nuevasGuardadas = {};
            const nuevasLeidas = new Set();
            for (let i = 0; i < this._historiasGeneradas.length; i++) {
                const oldKey = `historia_${i >= idx ? i + 1 : i}`;
                const newKey = `historia_${i}`;
                if (this._historiasGuardadas[i >= idx ? i + 1 : i]) {
                    nuevasGuardadas[i] = true;
                }
                if (this._historiasLeidas.has(oldKey)) {
                    nuevasLeidas.add(newKey);
                }
            }
            this._historiasGuardadas = nuevasGuardadas;
            this._historiasLeidas = nuevasLeidas;

            // Reindexar la referencia de historia en estudio
            if (this._historiaEnEstudio !== null) {
                if (this._historiaEnEstudio === idx) {
                    this._historiaEnEstudio = null;
                } else if (this._historiaEnEstudio > idx) {
                    this._historiaEnEstudio--;
                }
            }

            this._guardarEstadoCompleto();
            this._renderizarPanel();
            this._core?.mostrarToast(`🗑️ Historia "${historia.titulo || 'Sin título'}" eliminada`, 'warning');
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }

        } catch (error) {
            console.error('❌ Error eliminando historia:', error);
            this._core?.mostrarToast('❌ Error al eliminar la historia', 'error');
        }
    }

    // ============================================================
    // 🔥 ESTUDIAR HISTORIA COMPLETA
    // ============================================================

    async _estudiarHistoriaCompleta(idx) {
        const historia = this._historiasGeneradas[idx];
        if (!historia || !historia.frases || historia.frases.length === 0) {
            this._core?.mostrarToast('❌ Esta historia no tiene frases para estudiar', 'error');
            return;
        }

        try {
            this._historiaActual = historia;
            this._estudiandoHistoriaCompleta = true;
            this._historiaEnEstudio = idx;
            
            let historiaId = historia.id;
            if (!historiaId || !this._historiasGuardadas[idx]) {
                const idioma = 'zh';
                const nivel = this._obtenerNivelRealUsuario();
                const caracterBase = this._caracterActual || 'Carácter base';
                const tituloHistoria = historia.titulo || `Historia de tonos - ${caracterBase}`;
                
                const historiaObj = {
                    titulo: tituloHistoria,
                    idioma: idioma,
                    nivel: nivel,
                    fechaCreacion: new Date().toISOString(),
                    estado: 'en_curso',
                    frases: historia.frases ? historia.frases.length : 0,
                    _esTono: true,
                    _caracterBase: caracterBase,
                    _tono: historia.tono || 'Desconocido',
                    _esImportada: true,
                    _historiasTonos: true
                };
                
                historiaId = await db.guardarHistoria(historiaObj);
                if (historiaId) {
                    let frasesGuardadas = 0;
                    if (historia.frases) {
                        for (const f of historia.frases) {
                            if (!f.hanzi && !f.original) continue;
                            const fraseObj = {
                                original: f.hanzi || f.original || '',
                                traduccion: f.traduccion || '',
                                historiaId: historiaId,
                                idioma: idioma,
                                nivel: nivel,
                                esJeroglifico: true,
                                pinyinCompleto: f.pinyin || '',
                                reglaGramatical: `Tono: ${f.tono || 'Desconocido'}`,
                                tipoRegla: 'tono',
                                familiaSemantica: `Historia de tonos - ${caracterBase}`,
                                palabras: [],
                                activa: true,
                                rg: 0,
                                rcn: 0,
                                _esTono: true,
                                _tono: f.tono || 'Desconocido',
                                _caracterBase: caracterBase,
                                _historiaId: historiaId
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
                    
                    this._historiasGeneradas[idx].id = historiaId;
                    this._historiasGuardadas[idx] = true;
                    this._guardarEstadoCompleto();
                }
            }
            
            const frasesDB = await db.obtenerFrasesPorHistoria(historiaId);
            
            const frasesParaEstudiar = [];
            for (const f of frasesDB) {
                const historiaOriginal = this._historiasGeneradas[idx];
                let tonoEncontrado = 'Desconocido';
                let caracterBase = this._caracterActual || 'Carácter base';
                
                if (historiaOriginal && historiaOriginal.frases) {
                    for (const hf of historiaOriginal.frases) {
                        if (hf.hanzi === f.original || hf.original === f.original) {
                            tonoEncontrado = hf.tono || 'Desconocido';
                            caracterBase = hf.caracter_usado || this._caracterActual || 'Carácter base';
                            break;
                        }
                    }
                }
                
                const fraseObj = {
                    id: f.id,
                    original: f.original || '',
                    traduccion: f.traduccion || '',
                    pinyinCompleto: f.pinyinCompleto || '',
                    esJeroglifico: true,
                    idioma: 'zh',
                    nivel: f.nivel || this._obtenerNivelRealUsuario(),
                    palabras: f.palabras || [],
                    reglaGramatical: `Tono: ${tonoEncontrado}`,
                    _esTono: true,
                    _tono: tonoEncontrado,
                    _caracterBase: caracterBase,
                    _historiaIdx: idx,
                    _historiaTitulo: historia.titulo || 'Historia sin título',
                    _historiaId: historiaId,
                    progreso: null
                };
                
                try {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso) {
                        fraseObj.progreso = progreso;
                    }
                } catch (e) {}
                
                frasesParaEstudiar.push(fraseObj);
            }
            
            if (frasesParaEstudiar.length === 0) {
                this._core?.mostrarToast('❌ No se encontraron frases para estudiar', 'error');
                return;
            }
            
            if (window.pipeline) {
                pipeline.frases = frasesParaEstudiar;
                pipeline.indiceFrase = 0;
                await pipeline.cargarFrase(0);
                pipeline._estudiandoHistoria = true;
                pipeline._historiaIdActual = historiaId;
                pipeline._origenHistoria = 'tonos';
                
                if (this._core) {
                    this._core.irAModulo('study');
                    this._core.mostrarToast(`📖 Estudiando: "${historia.titulo}" (${frasesParaEstudiar.length} frases)`, 'success');
                    
                    setTimeout(() => {
                        this._inyectarBotonVolverTonos();
                    }, 300);
                }
            } else {
                this._core?.mostrarToast('❌ Pipeline no disponible', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error estudiando historia:', error);
            this._core?.mostrarToast('❌ Error al estudiar la historia', 'error');
        }
    }

    // ============================================================
    // 🔥 LEER HISTORIA COMPLETA (VISOR CON OCULTAR TRADUCCIÓN)
    // ============================================================

    async _leerHistoriaCompleta(idx) {
        const historia = this._historiasGeneradas[idx];
        if (!historia || !historia.frases || historia.frases.length === 0) {
            this._core?.mostrarToast('❌ Esta historia no tiene frases para leer', 'error');
            return;
        }

        try {
            const historiaId = historia.id;
            if (!historiaId) {
                this._core?.mostrarToast('❌ Esta historia no está guardada. Primero estúdiala o guárdala.', 'warning');
                return;
            }

            const historiaDB = await db.get('historias', historiaId);
            if (!historiaDB) {
                this._core?.mostrarToast('❌ Historia no encontrada en la base de datos', 'error');
                return;
            }

            const frasesDB = await db.obtenerFrasesPorHistoria(historiaId);
            
            const frasesCompletas = [];
            for (const f of frasesDB) {
                const palabrasCompletas = [];
                if (f.palabras && Array.isArray(f.palabras)) {
                    for (const p of f.palabras) {
                        if (p && typeof p === 'object' && p.id) {
                            try {
                                const palabraCompleta = await db.get('palabras', p.id);
                                if (palabraCompleta) {
                                    palabrasCompletas.push(palabraCompleta);
                                } else {
                                    palabrasCompletas.push(p);
                                }
                            } catch (e) {
                                palabrasCompletas.push(p);
                            }
                        } else {
                            palabrasCompletas.push(p);
                        }
                    }
                }
                frasesCompletas.push({
                    ...f,
                    palabras: palabrasCompletas
                });
            }

            this._historiaVisor = {
                id: historiaId,
                idx: idx,
                titulo: historiaDB.titulo || historia.titulo || 'Historia sin título',
                frases: frasesCompletas,
                tono: historiaDB._tono || historia.tono || 'Desconocido',
                caracterBase: historiaDB._caracterBase || this._caracterActual || 'Carácter base'
            };
            
            this._visorAbierto = true;
            this._renderizarVisorHistoriaTonal();
            
        } catch (error) {
            console.error('❌ Error leyendo historia:', error);
            this._core?.mostrarToast('❌ Error al leer la historia', 'error');
        }
    }

    // ============================================================
    // 🔥 RENDERIZAR VISOR DE HISTORIA TONAL CON OCULTAR TRADUCCIÓN
    // ============================================================

    _renderizarVisorHistoriaTonal() {
        const container = this._getContainer();
        if (!container) return;
        
        const historia = this._historiaVisor;
        if (!historia) return;
        
        const esJeroglifico = true;
        const titulo = historia.titulo || 'Historia sin título';
        const tonoColor = this._getColorTono(historia.tono);
        const caracterBase = historia.caracterBase || this._caracterActual || 'Carácter base';
        const nivel = this._obtenerNivelRealUsuario();
        const idioma = 'zh';
        const ocultarTraduccion = this._visorOcultarTraduccion;
        
        let html = `
            <div style="padding:16px;max-width:900px;margin:0 auto;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;padding:8px 16px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:12px;border:2px solid var(--primary)20;">
                    <button class="btn-secondary" onclick="window.UITonos._cerrarVisorTonal()" style="padding:6px 14px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                    <span style="font-size:24px;">📖</span>
                    <div style="flex:1;">
                        <h2 style="font-size:20px;font-weight:800;color:var(--dark);margin:0;">${titulo}</h2>
                        <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">
                            🎵 Tono: <span style="color:${tonoColor};font-weight:600;">${historia.tono}</span>
                            · 🀄 Carácter base: <strong>${caracterBase}</strong>
                            · ${historia.frases.length} frases
                        </p>
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;">
                        <!-- 🔥 CHECKBOX OCULTAR TRADUCCIÓN -->
                        <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:4px 12px;background:${ocultarTraduccion ? 'var(--warning)15' : 'var(--bg)'};border-radius:8px;border:1px solid ${ocultarTraduccion ? 'var(--warning)' : 'var(--light)'};">
                            <input type="checkbox" ${ocultarTraduccion ? 'checked' : ''} 
                                   onchange="window.UITonos._toggleVisorTraduccion(this.checked)"
                                   style="margin:0;width:14px;height:14px;cursor:pointer;">
                            <span style="color:${ocultarTraduccion ? 'var(--warning)' : 'var(--gray)'};">
                                ${ocultarTraduccion ? '🔒 Traducción oculta' : '👁️ Mostrar traducción'}
                            </span>
                        </label>
                        <button class="btn-primary" onclick="window.UITonos._estudiarHistoriaVisor()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-play"></i> Estudiar
                        </button>
                        <button class="btn-secondary" onclick="window.UITonos._cerrarVisorTonal()" style="padding:4px 14px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:12px;">
        `;
        
        let numFrase = 0;
        for (const frase of historia.frases) {
            numFrase++;
            const hanzi = frase.original || '';
            const pinyin = frase.pinyinCompleto || '';
            const traduccion = frase.traduccion || '';
            const tono = frase._tono || historia.tono || 'Desconocido';
            const tonoColorFrase = this._getColorTono(tono);
            const palabras = frase.palabras || [];
            
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;box-shadow:var(--shadow);border-left:4px solid ${tonoColorFrase};">
                    <div style="display:flex;gap:8px;align-items:start;">
                        <span style="font-size:12px;font-weight:600;color:var(--gray-light);min-width:28px;">${numFrase}.</span>
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                <span style="font-size:24px;font-weight:700;color:var(--dark);line-height:1.6;">${hanzi}</span>
                                <span style="font-size:11px;color:${tonoColorFrase};font-weight:600;background:${tonoColorFrase}15;padding:2px 10px;border-radius:12px;">🎵 ${tono}</span>
                            </div>
                            ${pinyin ? `<div style="font-size:16px;color:var(--primary);margin-top:2px;letter-spacing:1px;font-weight:500;">🔊 ${pinyin}</div>` : ''}
                            ${!ocultarTraduccion ? `
                                <div style="font-size:16px;color:var(--gray);margin-top:4px;">→ ${traduccion}</div>
                            ` : `
                                <div style="font-size:13px;color:var(--warning);margin-top:4px;padding:4px 10px;background:var(--warning)08;border-radius:4px;display:inline-block;border:1px dashed var(--warning);">
                                    🔒 Traducción oculta (desmarca el checkbox para mostrarla)
                                </div>
                            `}
                            
                            ${palabras.length > 0 ? `
                                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid var(--light);">
                                    ${palabras.map(p => {
                                        const texto = p.palabra || p.hanzi || '';
                                        const pinyinPalabra = p.pinyin || '';
                                        const significado = p.significado || '';
                                        const familia = p.familia || 'sustantivo';
                                        const color = window.uiCore?._getColorFamilia(familia) || '#6C5CE7';
                                        return `
                                            <span style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;border-radius:10px;background:${color}15;border:1px solid ${color}30;cursor:pointer;font-size:13px;"
                                                  onclick="window.UITonos._abrirModalPalabraTonal('${texto}', '${pinyinPalabra}', '${significado}', '${familia}', '${idioma}', '${nivel}')"
                                                  onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                                  onmouseout="this.style.transform='none';this.style.boxShadow='none'"
                                                  title="Haz clic para ver detalles y guardar en Mi Espacio">
                                                <span style="font-weight:600;font-size:16px;color:${color};">${texto}</span>
                                                ${pinyinPalabra ? `<span style="font-size:10px;color:var(--gray-light);">${pinyinPalabra}</span>` : ''}
                                                ${significado ? `<span style="font-size:9px;color:var(--gray-light);">${significado}</span>` : ''}
                                                <span style="font-size:7px;color:var(--primary);margin-top:1px;">⭐</span>
                                            </span>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `
                                <div style="font-size:10px;color:var(--gray-light);margin-top:6px;padding:4px 10px;background:var(--bg);border-radius:4px;">
                                    ⚠️ Sin palabras desglosadas. Estudia la historia para generar las palabras.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
                
                <div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap;padding:12px 0;border-top:2px solid var(--light);">
                    <div style="display:flex;gap:6px;align-items:center;">
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;padding:6px 16px;background:${ocultarTraduccion ? 'var(--warning)15' : 'var(--bg)'};border-radius:8px;border:1px solid ${ocultarTraduccion ? 'var(--warning)' : 'var(--light)'};">
                            <input type="checkbox" ${ocultarTraduccion ? 'checked' : ''} 
                                   onchange="window.UITonos._toggleVisorTraduccion(this.checked)"
                                   style="margin:0;width:16px;height:16px;cursor:pointer;">
                            <span style="color:${ocultarTraduccion ? 'var(--warning)' : 'var(--gray)'};">
                                ${ocultarTraduccion ? '🔒 Ocultar traducción' : '👁️ Mostrar traducción'}
                            </span>
                        </label>
                    </div>
                    <button class="btn-primary" onclick="window.UITonos._estudiarHistoriaVisor()" style="padding:8px 24px;font-size:14px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-play"></i> Estudiar esta historia
                    </button>
                    <button class="btn-secondary" onclick="window.UITonos._cerrarVisorTonal()" style="padding:8px 24px;font-size:14px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                </div>
                
                <div style="margin-top:12px;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:10px;color:var(--gray-light);text-align:center;">
                    🖱️ Haz clic en cualquier palabra desglosada → Modal con información + Guardar en Mi Espacio
                    <br>🔄 Todo retorna al Estudio de Tonos
                    <br>🔒 Usa el checkbox para ocultar/mostrar la traducción y practicar tu comprensión
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        this._visorAbierto = true;
    }

    // ============================================================
    // 🔥 TOGGLE VISOR TRADUCCIÓN
    // ============================================================

    _toggleVisorTraduccion(checked) {
        this._visorOcultarTraduccion = checked;
        this._guardarEstadoCompleto();
        this._renderizarVisorHistoriaTonal();
        this._core?.mostrarToast(
            checked ? '🔒 Traducción oculta - Intenta leer y comprender por ti mismo' : '👁️ Traducción visible',
            'info'
        );
    }

    // ============================================================
    // CERRAR VISOR TONAL
    // ============================================================

    _cerrarVisorTonal() {
        this._visorAbierto = false;
        this._historiaVisor = null;
        this._visorOcultarTraduccion = false;
        this._renderizarPanel();
    }

    // ============================================================
    // ESTUDIAR HISTORIA DESDE VISOR
    // ============================================================

    async _estudiarHistoriaVisor() {
        if (!this._historiaVisor) {
            this._core?.mostrarToast('❌ No hay historia para estudiar', 'error');
            return;
        }
        
        const idx = this._historiaVisor.idx;
        if (idx === undefined || idx === null) {
            this._core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }
        
        this._cerrarVisorTonal();
        await this._estudiarHistoriaCompleta(idx);
    }

    // ============================================================
    // ABRIR MODAL DE PALABRA TONAL
    // ============================================================

    async _abrirModalPalabraTonal(texto, pinyin, significado, familia, idioma, nivel) {
        try {
            if (window.UIStudy && typeof window.UIStudy._abrirModalGuardarPalabra === 'function') {
                await window.UIStudy._abrirModalGuardarPalabra(texto, pinyin, significado, familia, idioma, nivel);
            } else {
                this._core?.mostrarToast(`📖 "${texto}" (${pinyin}): ${significado} · ${familia}`, 'info');
            }
        } catch (error) {
            console.warn('⚠️ Error abriendo modal de palabra:', error);
            this._core?.mostrarToast(`📖 "${texto}" - Guarda en Mi Espacio desde el estudio`, 'info');
        }
    }

    // ============================================================
    // INYECTAR BOTÓN VOLVER A HISTORIAS TONALES
    // ============================================================

    _inyectarBotonVolverTonos() {
        if (this._botonInyectado) return;
        
        console.log('🔧 Inyectando botón "Volver a Historias Tonales" en Estudio...');
        
        const header = document.querySelector('#studyModule .module-header');
        if (!header) {
            console.warn('⚠️ No se encontró el header del módulo de estudio, reintentando...');
            setTimeout(() => this._inyectarBotonVolverTonos(), 300);
            return;
        }
        
        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = 'none';
            console.log('🔒 Botón "Libro de Lectura" ocultado (Modo Tonos)');
        }
        
        const titleDiv = header.querySelector('.module-title');
        if (!titleDiv) {
            const existingBtn = document.getElementById('btnVolverTonos');
            if (existingBtn) return;
            
            const btn = document.createElement('button');
            btn.id = 'btnVolverTonos';
            btn.className = 'btn-primary';
            btn.style.cssText = `
                padding: 6px 16px;
                font-size: 12px;
                background: linear-gradient(135deg, #FDCB6E, #E17055);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 12px;
                font-weight: 600;
                font-family: var(--font, sans-serif);
                flex-shrink: 0;
            `;
            btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Historias Tonales';
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 4px 20px rgba(225,112,85,0.3)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'none';
                btn.style.boxShadow = 'none';
            };
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Botón "Volver a Historias Tonales" pulsado');
                this._volverAlModoTonos();
            };
            header.appendChild(btn);
            window._volverAlModoTonos = () => {
                this._volverAlModoTonos();
            };
            this._botonInyectado = true;
            console.log('✅ Botón "Volver a Historias Tonales" añadido');
            return;
        }
        
        if (document.getElementById('btnVolverTonos')) {
            this._botonInyectado = true;
            return;
        }
        
        const self = this;
        const btn = document.createElement('button');
        btn.id = 'btnVolverTonos';
        btn.className = 'btn-primary';
        btn.style.cssText = `
            padding: 6px 16px;
            font-size: 12px;
            background: linear-gradient(135deg, #FDCB6E, #E17055);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 12px;
            font-weight: 600;
            font-family: var(--font, sans-serif);
            flex-shrink: 0;
        `;
        btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Historias Tonales';
        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 4px 20px rgba(225,112,85,0.3)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'none';
            btn.style.boxShadow = 'none';
        };
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botón "Volver a Historias Tonales" pulsado');
            self._volverAlModoTonos();
        };
        
        titleDiv.appendChild(btn);
        window._volverAlModoTonos = function() {
            self._volverAlModoTonos();
        };
        this._botonInyectado = true;
        console.log('✅ Botón "Volver a Historias Tonales" añadido al módulo de estudio');
    }

    // ============================================================
    // VOLVER AL MÓDULO DE TONOS - CON MARCADO DE COMPLETADO
    // ============================================================

    async _volverAlModoTonos() {
        console.log('🔄 Volviendo al Modo Tonos...');
        
        try {
            if (this._historiaEnEstudio !== null && this._historiaEnEstudio !== undefined) {
                const idx = this._historiaEnEstudio;
                const historia = this._historiasGeneradas[idx];
                
                if (historia) {
                    let todasCompletadas = true;
                    let frasesTotales = 0;
                    let frasesCompletadas = 0;
                    
                    if (historia.id) {
                        const frasesDB = await db.obtenerFrasesPorHistoria(historia.id);
                        frasesTotales = frasesDB.length;
                        for (const f of frasesDB) {
                            const progreso = await db.obtenerProgreso(f.id);
                            if (progreso && (progreso.estado === 'completada' || progreso.rcn >= 4)) {
                                frasesCompletadas++;
                            } else {
                                todasCompletadas = false;
                            }
                        }
                    }
                    
                    if (todasCompletadas && frasesTotales > 0) {
                        console.log(`✅ Historia "${historia.titulo}" completada (${frasesCompletadas}/${frasesTotales})`);
                        historia.completada = true;
                        
                        if (historia.id) {
                            const historiaDB = await db.get('historias', historia.id);
                            if (historiaDB) {
                                historiaDB.estado = 'completada';
                                historiaDB._completada = true;
                                historiaDB._fechaCompletado = Date.now();
                                historiaDB._rcnPromedio = 5.0;
                                await db.update('historias', historiaDB);
                                
                                window.dispatchEvent(new CustomEvent('historiaCompletada', {
                                    detail: {
                                        historiaId: historia.id,
                                        historiaTitulo: historia.titulo,
                                        temaId: null,
                                        idioma: 'zh',
                                        completado: true,
                                        origen: 'tonos'
                                    }
                                }));
                                
                                this._core?.mostrarToast(`✅ "${historia.titulo}" completada!`, 'success');
                            }
                        }
                        this._guardarEstadoCompleto();
                    } else if (frasesTotales > 0) {
                        console.log(`📊 Progreso de "${historia.titulo}": ${frasesCompletadas}/${frasesTotales}`);
                    }
                }
            }
            
            this._estudiandoHistoriaCompleta = false;
            this._historiaEnEstudio = null;
            
            if (window.pipeline) {
                pipeline._estudiandoHistoria = false;
                pipeline._historiaIdActual = null;
                pipeline._origenHistoria = null;
            }
            
            const btnVolver = document.getElementById('btnVolverTonos');
            if (btnVolver) btnVolver.remove();
            
            const btnLibro = document.getElementById('btnLibroLectura');
            if (btnLibro) btnLibro.style.display = '';
            
            this._botonInyectado = false;
            
            if (this._core) {
                this._core.irAModulo('tonos');
                setTimeout(() => {
                    this._renderizarPanel();
                    const idx = this._historiaEnEstudio;
                    if (idx !== null && idx !== undefined && this._historiasGeneradas[idx]?.completada) {
                        this._core?.mostrarToast('✅ Historia completada. Volviendo a Historias Tonales', 'success');
                    } else {
                        this._core?.mostrarToast('🔄 Volviendo a Historias Tonales', 'info');
                    }
                    this._historiaEnEstudio = null;
                }, 300);
            }
            
        } catch (error) {
            console.error('❌ Error en _volverAlModoTonos:', error);
            this._core?.mostrarToast('❌ Error al volver al Modo Tonos', 'error');
        }
    }

    // ============================================================
    // GUARDAR HISTORIA EN MI ESPACIO
    // ============================================================

    async _guardarHistoria(idx) {
        const historia = this._historiasGeneradas[idx];
        if (!historia) {
            this._core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        if (this._historiasGuardadas[idx]) {
            this._core?.mostrarToast('ℹ️ Esta historia ya está guardada', 'info');
            return;
        }

        this._core?.mostrarToast('💾 Guardando historia...', 'info');

        try {
            const idioma = 'zh';
            const nivel = this._obtenerNivelRealUsuario();
            const caracterBase = this._caracterActual || 'Carácter base';
            const tituloHistoria = historia.titulo || `Historia de tonos - ${caracterBase}`;

            const historiaObj = {
                titulo: tituloHistoria,
                idioma: idioma,
                nivel: nivel,
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                frases: historia.frases ? historia.frases.length : 0,
                _esTono: true,
                _caracterBase: caracterBase,
                _tono: historia.tono || 'Desconocido',
                _esImportada: true,
                _historiasTonos: true
            };

            const historiaId = await db.guardarHistoria(historiaObj);

            if (historiaId) {
                let frasesGuardadas = 0;
                if (historia.frases) {
                    for (const f of historia.frases) {
                        if (!f.hanzi && !f.original) continue;
                        
                        const fraseObj = {
                            original: f.hanzi || f.original || '',
                            traduccion: f.traduccion || '',
                            historiaId: historiaId,
                            idioma: idioma,
                            nivel: nivel,
                            esJeroglifico: true,
                            pinyinCompleto: f.pinyin || '',
                            reglaGramatical: `Tono: ${f.tono || 'Desconocido'}`,
                            tipoRegla: 'tono',
                            familiaSemantica: `Historia de tonos - ${caracterBase}`,
                            palabras: [],
                            activa: true,
                            rg: 0,
                            rcn: 0,
                            _esTono: true,
                            _tono: f.tono || 'Desconocido',
                            _caracterBase: caracterBase,
                            _historiaId: historiaId
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

                this._historiasGuardadas[idx] = true;
                this._core?.mostrarToast(`✅ Historia "${tituloHistoria}" guardada en Mi Espacio (${frasesGuardadas} frases)`, 'success');
                
                if (window.gestorFavoritos) {
                    await window.gestorFavoritos.añadirHistoria(historiaId);
                    await window.gestorFavoritos.añadirHistoriaAGrupo(historiaId, `🎵 Tonos - ${caracterBase}`);
                    await window.gestorFavoritos.añadirHistoriaAGrupo(historiaId, `📚 Nivel ${nivel}`);
                }
                
                this._guardarEstadoCompleto();
                this._renderizarPanel();
                
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this._core);
                }
                if (window.UIEspacio) {
                    window.UIEspacio._renderizarMiEspacio();
                }
            } else {
                throw new Error('No se pudo guardar la historia');
            }

        } catch (error) {
            console.error('❌ Error guardando historia:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GUARDAR TODAS LAS HISTORIAS
    // ============================================================

    async _guardarTodasHistorias() {
        let guardadas = 0;
        let yaGuardadas = 0;
        let errores = 0;

        for (let i = 0; i < this._historiasGeneradas.length; i++) {
            if (this._historiasGuardadas[i]) {
                yaGuardadas++;
                continue;
            }
            try {
                await this._guardarHistoria(i);
                guardadas++;
            } catch (e) {
                errores++;
            }
        }

        this._core?.mostrarToast(
            `✅ ${guardadas} historias guardadas${yaGuardadas > 0 ? `, ${yaGuardadas} ya existentes` : ''}${errores > 0 ? `, ${errores} errores` : ''}`,
            'success'
        );
    }

    // ============================================================
    // GENERAR HISTORIA CON TODOS LOS TONOS
    // ============================================================

    async _generarHistoriaTonos() {
        if (this._generando) {
            this._core?.mostrarToast('⏳ Ya hay una generación en curso', 'warning');
            return;
        }

        if (!this._caracterActual || !this._tonosData) {
            this._core?.mostrarToast('❌ Selecciona un carácter primero', 'error');
            return;
        }

        this._generando = true;
        this._core?.mostrarToast(`📖 Generando historia para "${this._caracterActual}"...`, 'info');

        try {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'zh';
            const idiomaNativo = this._obtenerIdiomaNativo();
            const nivel = this._obtenerNivelRealUsuario();
            const significadoBase = this._tonosData.significado || this._caracterActual;

            const tonosList = Object.keys(this._tonosData.tonos || {});
            
            const tituloSugerido = `Historia con "${this._caracterActual}" (${significadoBase})`;
            
            const template = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "7.5",
                    "accion": `Genera una historia de 8-10 líneas en Chino que use el carácter "${this._caracterActual}" en TODOS sus tonos`,
                    "caracter_principal": this._caracterActual,
                    "significado_base": significadoBase,
                    "tonos_disponibles": tonosList,
                    "idioma_objetivo": idioma,
                    "idioma_nativo": idiomaNativo,
                    "nivel": nivel,
                    "num_lineas": "8-10",
                    "instrucciones": [
                        `1. Escribe una historia de 8 a 10 líneas en Chino.`,
                        `2. Cada línea debe ser una frase corta y natural.`,
                        `3. La historia DEBE incluir el carácter "${this._caracterActual}" en TODOS los tonos disponibles.`,
                        `4. Cada línea debe incluir el pinyin COMPLETO de la frase.`,
                        `5. Cada línea debe tener su traducción al ${idiomaNativo}.`,
                        `6. Las frases deben formar una historia coherente.`,
                        `7. Marca qué tono se usa en cada línea.`,
                        `8. IMPORTANTE: NO uses placeholders como [frase] o [pinyin].`,
                        `9. Responde SOLO en formato JSON válido.`,
                        `10. 🔥 IMPORTANTE: El título de la historia debe ser NATURAL y DESCRIPTIVO, relacionado con el contenido de la historia.`,
                        `11. 🔥 IMPORTANTE: Para CADA línea, incluye un array 'palabras' con TODAS las palabras de la frase.`,
                        `12. Cada palabra debe tener: 'hanzi', 'pinyin', 'significado', 'familia_semantica', 'tipo_gramatical'.`,
                        `13. Ejemplo de palabra: {"hanzi": "家", "pinyin": "jiā", "significado": "casa/hogar", "familia_semantica": "Familia", "tipo_gramatical": "sustantivo"}`,
                        `14. Si no puedes identificar una palabra, usa "significado": "desconocido" y "tipo_gramatical": "sustantivo".`
                    ],
                    "formato": {
                        "lineas": [
                            {
                                "numero": 1,
                                "hanzi": "Frase en Chino",
                                "pinyin": "pinyin_con_tonos_de_la_frase",
                                "traduccion": "Traducción al " + idiomaNativo,
                                "tono_usado": "Ej: mā",
                                "caracter_usado": this._caracterActual,
                                "palabras": [
                                    {
                                        "hanzi": "Palabra 1",
                                        "pinyin": "pinyin_palabra_1",
                                        "significado": "significado en " + idiomaNativo,
                                        "familia_semantica": "Familia semántica",
                                        "tipo_gramatical": "sustantivo/verbo/adjetivo/etc"
                                    }
                                ]
                            }
                        ]
                    }
                },
                "meta": {
                    "caracter": this._caracterActual,
                    "tonos": tonosList,
                    "idioma": idioma,
                    "idioma_nativo": idiomaNativo,
                    "nivel": nivel,
                    "num_lineas": "8-10",
                    "fecha_generacion": new Date().toISOString(),
                    "version": "7.5",
                    "titulo_historia": tituloSugerido
                },
                "lineas": tonosList.map((tono, idx) => ({
                    "numero": idx + 1,
                    "hanzi": `[Frase ${idx+1} con el carácter "${this._caracterActual}" en tono ${tono}]`,
                    "pinyin": `[pinyin_con_tonos_de_la_frase_${idx+1}]`,
                    "traduccion": `[Traducción al ${idiomaNativo} de la frase ${idx+1}]`,
                    "tono_usado": tono,
                    "caracter_usado": this._caracterActual,
                    "palabras": [
                        {
                            "hanzi": "[palabra_1]",
                            "pinyin": "[pinyin_palabra_1]",
                            "significado": "[significado_en_" + idiomaNativo + "]",
                            "familia_semantica": "[familia_semantica]",
                            "tipo_gramatical": "[tipo_gramatical]"
                        }
                    ]
                }))
            };

            while (template.lineas.length < 8) {
                const idx = template.lineas.length;
                const tono = tonosList[idx % tonosList.length];
                template.lineas.push({
                    "numero": idx + 1,
                    "hanzi": `[Frase ${idx+1} con el carácter "${this._caracterActual}" en tono ${tono}]`,
                    "pinyin": `[pinyin_con_tonos_de_la_frase_${idx+1}]`,
                    "traduccion": `[Traducción al ${idiomaNativo} de la frase ${idx+1}]`,
                    "tono_usado": tono,
                    "caracter_usado": this._caracterActual,
                    "palabras": [
                        {
                            "hanzi": "[palabra_1]",
                            "pinyin": "[pinyin_palabra_1]",
                            "significado": "[significado_en_" + idiomaNativo + "]",
                            "familia_semantica": "[familia_semantica]",
                            "tipo_gramatical": "[tipo_gramatical]"
                        }
                    ]
                });
            }

            this._mostrarModalHistoriaJSON(template);
            this._core?.mostrarToast('📄 Plantilla JSON generada. Copia, completa con IA externa e importa.', 'success');

        } catch (error) {
            console.error('❌ Error generando historia:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }

        this._generando = false;
    }

    // ============================================================
    // MOSTRAR MODAL CON JSON DE HISTORIA
    // ============================================================

    _mostrarModalHistoriaJSON(template) {
        if (!this._core) return;

        this._core.abrirModal('📖 Generar Historia de Tonos');

        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = JSON.stringify(template, null, 2);
            textarea.readOnly = false;
            textarea.style.minHeight = '500px';
            textarea.style.fontSize = '12px';
            textarea.style.fontFamily = 'monospace';
        }

        const infoDiv = document.createElement('div');
        infoDiv.id = 'historiaInfoDiv';
        infoDiv.style.cssText = `
            background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 12px;
            font-size: 12px;
            color: var(--gray);
            border-left: 4px solid var(--primary);
        `;
        infoDiv.innerHTML = `
            <strong>📋 Instrucciones:</strong><br>
            1. Copia este JSON y envíalo a Groq/ChatGPT con las instrucciones que contiene.<br>
            2. La IA completará el JSON con una historia de 8-10 líneas.<br>
            3. <strong>IMPORTANTE:</strong> Cada línea debe usar el carácter en un tono diferente.<br>
            4. <strong>🔥 IMPORTANTE:</strong> El título de la historia debe ser NATURAL y DESCRIPTIVO.<br>
            5. <strong>🔥 IMPORTANTE:</strong> Cada línea debe incluir palabras desglosadas con pinyin, significado y tipo.<br>
            6. Cuando la IA te devuelva el JSON completado, pégalo aquí y pulsa <strong>"Importar"</strong>.<br>
            7. La historia se guardará como una unidad completa con todas sus frases y palabras.<br>
            <br>
            <span style="font-size:11px;color:var(--gray-light);">
                🎯 Carácter: <strong>${this._caracterActual}</strong> · Tonos: ${Object.keys(this._tonosData.tonos || {}).join(', ')}
            </span>
            <br>
            <span style="font-size:10px;color:var(--success);">
                🔥 SIN CONSUMO DE TOKENS - Solo generas la plantilla, la IA externa la completa.
            </span>
            <br>
            <span style="font-size:10px;color:var(--primary);">
                📖 Ejemplo de título natural: "Mi familia feliz" en lugar de "Historia de tonos - 家"
            </span>
            <br>
            <span style="font-size:10px;color:var(--secondary);">
                📝 Las palabras desglosadas permiten ver el significado de cada palabra al leer la historia.
            </span>
        `;

        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            const oldInfo = modalBody.querySelector('#historiaInfoDiv');
            if (oldInfo) oldInfo.remove();
            modalBody.insertBefore(infoDiv, modalBody.firstChild);
        }

        const importBtn = document.getElementById('jsonImport');
        if (importBtn) {
            const newImportBtn = importBtn.cloneNode(true);
            importBtn.parentNode.replaceChild(newImportBtn, importBtn);
            
            const self = this;
            newImportBtn.onclick = async function() {
                const jsonText = document.getElementById('jsonTextarea').value;
                if (jsonText) {
                    try {
                        const data = JSON.parse(jsonText);
                        
                        const primeraLinea = data.lineas?.[0]?.hanzi || '';
                        if (primeraLinea.includes('[') || primeraLinea.includes('Frase')) {
                            self._core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Completa el JSON con la IA y luego importa.', 'warning');
                            return;
                        }
                        
                        await self._importarHistoriaJSON(data);
                        self._core.cerrarModal();
                        self._core.mostrarToast('✅ Historia importada correctamente', 'success');
                        self._renderizarPanel();
                    } catch (e) {
                        self._core?.mostrarToast('❌ Error: ' + e.message, 'error');
                    }
                }
            };
        }

        const copyBtn = document.getElementById('jsonCopy');
        if (copyBtn) {
            const newCopyBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
            newCopyBtn.onclick = function() {
                const textarea = document.getElementById('jsonTextarea');
                if (textarea) {
                    navigator.clipboard.writeText(textarea.value)
                        .then(() => self._core?.mostrarToast('📋 JSON copiado al portapapeles', 'success'))
                        .catch(() => {
                            textarea.select();
                            document.execCommand('copy');
                            self._core?.mostrarToast('📋 JSON copiado al portapapeles', 'success');
                        });
                }
            };
        }
    }

    // ============================================================
    // IMPORTAR HISTORIA DESDE JSON - CON PALABRAS DESGLOSADAS
    // ============================================================

    async _importarHistoriaJSON(data) {
        if (this._importando) {
            this._core?.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }

        if (!data || !data.lineas || !Array.isArray(data.lineas) || data.lineas.length === 0) {
            throw new Error('JSON inválido: debe contener "lineas"');
        }

        this._importando = true;

        try {
            const idioma = 'zh';
            const nivel = data.meta?.nivel || this._obtenerNivelRealUsuario();
            const caracterBase = data.meta?.caracter || this._caracterActual || 'Carácter base';
            
            let tituloHistoria = data.meta?.titulo_historia || `Historia con "${caracterBase}"`;
            
            if (tituloHistoria.includes('Historia de tonos') || tituloHistoria.includes('Historia con')) {
                const primerasLineas = data.lineas.slice(0, 3).map(l => l.hanzi || '').join(' ');
                const palabrasClave = ['家', '我', '你', '他', '她', '们', '人', '朋友', '家人', '老师', '学生', '工作', '生活', '学习', '吃饭', '睡觉', '走路', '跑步', '看书', '写字', '说话', '唱歌', '跳舞', '旅行', '购物', '做饭', '打扫', '休息'];
                let temaEncontrado = null;
                for (const palabra of palabrasClave) {
                    if (primerasLineas.includes(palabra)) {
                        const significado = this._DICCIONARIO[palabra] || palabra;
                        temaEncontrado = `${palabra} (${significado})`;
                        break;
                    }
                }
                if (temaEncontrado) {
                    tituloHistoria = `Historia sobre ${temaEncontrado}`;
                } else {
                    const significadoBase = this._tonosData?.significado || caracterBase;
                    tituloHistoria = `Práctica de tonos: "${caracterBase}" (${significadoBase})`;
                }
            }

            const tonoPrincipal = data.lineas[0]?.tono_usado || 'Desconocido';

            const historiaObj = {
                titulo: tituloHistoria,
                idioma: idioma,
                nivel: nivel,
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                frases: data.lineas.length,
                _esTono: true,
                _caracterBase: caracterBase,
                _tono: tonoPrincipal,
                _esImportada: true,
                _historiasTonos: true,
                _tonosUsados: data.lineas.map(l => l.tono_usado).filter(t => t)
            };

            const historiaId = await db.guardarHistoria(historiaObj);

            if (!historiaId) {
                throw new Error('No se pudo guardar la historia');
            }

            const frasesGuardadas = [];
            let importadas = 0;
            let duplicadas = 0;
            let errores = 0;

            const frasesExistentes = await db.obtenerFrasesPorIdioma(idioma);

            for (const linea of data.lineas) {
                if (!linea.hanzi || !linea.pinyin || !linea.traduccion) {
                    errores++;
                    continue;
                }

                const existe = frasesExistentes.some(ef => 
                    ef.original === linea.hanzi && ef.idioma === idioma
                );

                if (existe) {
                    duplicadas++;
                    continue;
                }

                try {
                    let palabrasIds = [];
                    
                    if (linea.palabras && Array.isArray(linea.palabras) && linea.palabras.length > 0) {
                        for (const p of linea.palabras) {
                            if (!p.hanzi) continue;
                            try {
                                const existentes = await db.obtenerPalabrasPorIdioma(idioma);
                                let existente = existentes.find(e => 
                                    (e.palabra || e.hanzi || '') === p.hanzi
                                );
                                let idPalabra;
                                if (existente) {
                                    idPalabra = existente.id;
                                    existente.frecuencia = (existente.frecuencia || 0) + 1;
                                    if (p.pinyin) existente.pinyin = p.pinyin;
                                    if (p.significado) existente.significado = p.significado;
                                    await db.guardarPalabra(existente);
                                } else {
                                    const nuevaPalabra = {
                                        palabra: p.hanzi,
                                        hanzi: p.hanzi,
                                        pinyin: p.pinyin || '',
                                        significado: p.significado || p.hanzi,
                                        familia: p.tipo_gramatical || 'sustantivo',
                                        familias: [p.tipo_gramatical || 'sustantivo'],
                                        familiaSemantica: p.familia_semantica || 'General',
                                        nivel: nivel,
                                        tipo: p.tipo_gramatical || 'sustantivo',
                                        idioma: idioma,
                                        frecuencia: 1,
                                        neuroScore: 0.5,
                                        nivelDominio: 'nuevo',
                                        fechaCreacion: Date.now(),
                                        _esTono: true,
                                        _caracterBase: caracterBase
                                    };
                                    idPalabra = await db.guardarPalabra(nuevaPalabra);
                                }
                                if (idPalabra) {
                                    palabrasIds.push({
                                        id: idPalabra,
                                        palabra: p.hanzi,
                                        hanzi: p.hanzi,
                                        pinyin: p.pinyin || '',
                                        significado: p.significado || p.hanzi,
                                        familia: p.tipo_gramatical || 'sustantivo'
                                    });
                                }
                            } catch (e) {
                                console.warn(`⚠️ Error guardando palabra "${p.hanzi}":`, e);
                            }
                        }
                    } else {
                        const palabrasExtraidas = this._extraerPalabrasDeFrase(linea.hanzi, linea.pinyin, idioma, nivel, caracterBase);
                        for (const p of palabrasExtraidas) {
                            try {
                                const existentes = await db.obtenerPalabrasPorIdioma(idioma);
                                let existente = existentes.find(e => 
                                    (e.palabra || e.hanzi || '') === p.hanzi
                                );
                                let idPalabra;
                                if (existente) {
                                    idPalabra = existente.id;
                                    existente.frecuencia = (existente.frecuencia || 0) + 1;
                                    await db.guardarPalabra(existente);
                                } else {
                                    const nuevaPalabra = {
                                        palabra: p.hanzi,
                                        hanzi: p.hanzi,
                                        pinyin: p.pinyin || '',
                                        significado: p.significado || p.hanzi,
                                        familia: p.familia || 'sustantivo',
                                        familias: [p.familia || 'sustantivo'],
                                        familiaSemantica: p.familiaSemantica || 'General',
                                        nivel: nivel,
                                        tipo: p.tipo || 'sustantivo',
                                        idioma: idioma,
                                        frecuencia: 1,
                                        neuroScore: 0.5,
                                        nivelDominio: 'nuevo',
                                        fechaCreacion: Date.now(),
                                        _esTono: true,
                                        _caracterBase: caracterBase
                                    };
                                    idPalabra = await db.guardarPalabra(nuevaPalabra);
                                }
                                if (idPalabra) {
                                    palabrasIds.push({
                                        id: idPalabra,
                                        palabra: p.hanzi,
                                        hanzi: p.hanzi,
                                        pinyin: p.pinyin || '',
                                        significado: p.significado || p.hanzi,
                                        familia: p.familia || 'sustantivo'
                                    });
                                }
                            } catch (e) {
                                console.warn(`⚠️ Error guardando palabra "${p.hanzi}":`, e);
                            }
                        }
                    }

                    const fraseObj = {
                        original: linea.hanzi.trim(),
                        traduccion: linea.traduccion.trim(),
                        historiaId: historiaId,
                        idioma: idioma,
                        nivel: nivel,
                        esJeroglifico: true,
                        pinyinCompleto: linea.pinyin.trim(),
                        reglaGramatical: `Tono: ${linea.tono_usado || 'Desconocido'}`,
                        tipoRegla: 'tono',
                        familiaSemantica: `Historia de tonos - ${caracterBase}`,
                        palabras: palabrasIds,
                        activa: true,
                        rg: 0,
                        rcn: 0,
                        _esTono: true,
                        _tono: linea.tono_usado || 'Desconocido',
                        _caracterBase: linea.caracter_usado || caracterBase,
                        _historiaId: historiaId
                    };

                    const id = await db.guardarFrase(fraseObj);

                    if (id) {
                        importadas++;
                        frasesGuardadas.push(id);
                    } else {
                        errores++;
                    }

                } catch (e) {
                    console.warn(`⚠️ Error importando línea "${linea.hanzi}":`, e);
                    errores++;
                }
            }

            await db.update('historias', {
                ...historiaObj,
                id: historiaId,
                frases: frasesGuardadas.length
            });

            const resumenLineas = data.lineas.slice(0, 3).map(l => l.hanzi).join(' ... ');
            
            const nuevaHistoria = {
                id: historiaId,
                titulo: tituloHistoria,
                tono: tonoPrincipal,
                frases: data.lineas.map((l, i) => ({
                    ...l,
                    id: frasesGuardadas[i] || null
                })),
                resumen: resumenLineas || 'Sin resumen disponible',
                completada: false,
                _guardada: true
            };
            
            this._historiasGeneradas.push(nuevaHistoria);
            const idx = this._historiasGeneradas.length - 1;
            this._historiasGuardadas[idx] = true;
            this._historiasLeidas.add(`historia_${idx}`);

            this._guardarEstadoCompleto();

            const mensaje = `✅ Historia importada correctamente\n\n` +
                `📝 Líneas importadas: ${importadas}\n` +
                `⏭️ Duplicadas omitidas: ${duplicadas}\n` +
                `❌ Errores: ${errores}\n\n` +
                `📖 Título: "${tituloHistoria}"\n` +
                `📝 Palabras desglosadas: ${frasesGuardadas.length > 0 ? '✅ Incluidas' : '⚠️ No disponibles'}\n\n` +
                `💡 La historia está disponible para estudiar y leer.`;

            this._core?.alert(mensaje, '✅ Importación Completada');

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (window.UIEspacio) {
                window.UIEspacio._renderizarMiEspacio();
            }

        } catch (error) {
            console.error('❌ Error importando historia:', error);
            throw new Error('Error en el JSON: ' + error.message);
        } finally {
            this._importando = false;
        }
    }

    // ============================================================
    // EXTRAER PALABRAS DE UNA FRASE
    // ============================================================

    _extraerPalabrasDeFrase(hanzi, pinyin, idioma, nivel, caracterBase) {
        const palabras = [];
        
        if (!hanzi) return palabras;
        
        const segmentos = this._segmentarPorDiccionario(hanzi);
        const pinyinPalabras = pinyin ? pinyin.split(/\s+/) : [];
        
        let pIdx = 0;
        for (let i = 0; i < segmentos.segmentos.length; i++) {
            const seg = segmentos.segmentos[i];
            const py = pIdx < pinyinPalabras.length ? pinyinPalabras[pIdx] : '';
            pIdx++;
            
            let tipo = 'sustantivo';
            let familiaSemantica = 'General';
            let significado = seg;
            
            if (this._DICCIONARIO[seg]) {
                significado = this._DICCIONARIO[seg];
                if (['吃', '喝', '走', '跑', '跳', '坐', '站', '看', '听', '说', '做', '写', '读', '唱'].includes(seg)) {
                    tipo = 'verbo';
                } else if (['大', '小', '多', '少', '高', '矮', '胖', '瘦', '美', '丑', '好', '坏', '新', '旧', '快', '慢'].includes(seg)) {
                    tipo = 'adjetivo';
                } else if (['很', '非常', '特别', '更', '最', '太', '真', '十分', '比较'].includes(seg)) {
                    tipo = 'adverbio';
                } else if (['的', '了', '吗', '呢', '吧', '啊', '呀', '哦'].includes(seg)) {
                    tipo = 'partícula';
                } else if (['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万'].includes(seg)) {
                    tipo = 'numeral';
                } else if (['我', '你', '他', '她', '它', '我们', '你们', '他们', '她们', '大家', '自己'].includes(seg)) {
                    tipo = 'pronombre';
                }
            }
            
            const familiaMap = {
                '家': 'familia', '爸': 'familia', '妈': 'familia', '哥': 'familia', '妹': 'familia',
                '姐': 'familia', '弟': 'familia', '爷': 'familia', '奶': 'familia', '叔': 'familia',
                '姨': 'familia', '人': 'personas', '民': 'personas', '众': 'personas',
                '头': 'cuerpo', '手': 'cuerpo', '脚': 'cuerpo', '眼': 'cuerpo', '耳': 'cuerpo',
                '鼻': 'cuerpo', '口': 'cuerpo', '心': 'cuerpo', '身': 'cuerpo', '体': 'cuerpo',
                '山': 'naturaleza', '水': 'naturaleza', '火': 'naturaleza', '木': 'naturaleza',
                '金': 'naturaleza', '土': 'naturaleza', '日': 'naturaleza', '月': 'naturaleza',
                '星': 'naturaleza', '风': 'naturaleza', '米': 'comida', '面': 'comida',
                '肉': 'comida', '菜': 'comida', '果': 'comida', '茶': 'comida', '酒': 'comida',
                '饭': 'comida', '汤': 'comida', '油': 'comida', '房': 'casa', '门': 'casa',
                '窗': 'casa', '墙': 'casa', '桌': 'casa', '椅': 'casa', '床': 'casa',
                '灯': 'casa', '电': 'casa', '红': 'colores', '黄': 'colores', '蓝': 'colores',
                '绿': 'colores', '白': 'colores', '黑': 'colores', '灰': 'colores', '紫': 'colores',
                '粉': 'colores', '橙': 'colores', '走': 'verbos', '跑': 'verbos', '跳': 'verbos',
                '坐': 'verbos', '站': 'verbos', '看': 'verbos', '听': 'verbos', '说': 'verbos',
                '大': 'adjetivos', '小': 'adjetivos', '多': 'adjetivos', '少': 'adjetivos',
                '高': 'adjetivos', '矮': 'adjetivos', '美': 'adjetivos', '丑': 'adjetivos',
                '年': 'tiempo', '月': 'tiempo', '日': 'tiempo', '时': 'tiempo', '分': 'tiempo',
                '秒': 'tiempo', '早': 'tiempo', '晚': 'tiempo', '春': 'tiempo', '秋': 'tiempo'
            };
            familiaSemantica = familiaMap[seg] || 'General';
            
            if (seg.length > 1) {
                if (this._DICCIONARIO[seg]) {
                    significado = this._DICCIONARIO[seg];
                }
                if (seg.endsWith('们')) tipo = 'pronombre';
                else if (seg.endsWith('人')) tipo = 'sustantivo';
                else if (seg.endsWith('家')) { tipo = 'sustantivo'; familiaSemantica = 'familia'; }
                else if (seg.endsWith('师')) tipo = 'sustantivo';
                else if (seg.endsWith('生')) tipo = 'sustantivo';
                
                for (const [clave, valor] of Object.entries(familiaMap)) {
                    if (seg.includes(clave) && seg.length <= 3) {
                        familiaSemantica = valor;
                        break;
                    }
                }
            }
            
            let pinyinFinal = py;
            if (!pinyinFinal && this._DICCIONARIO[seg]) {
                pinyinFinal = this._DICCIONARIO[seg];
            }
            
            palabras.push({
                hanzi: seg,
                pinyin: pinyinFinal || '',
                significado: significado || seg,
                familia: tipo,
                tipo: tipo,
                familiaSemantica: familiaSemantica
            });
        }
        
        return palabras;
    }

    // ============================================================
    // LIMPIAR HISTORIAS
    // ============================================================

    async _limpiarHistorias() {
        const confirmar = await this._core?.confirm(
            `🧹 ¿Limpiar TODAS las historias generadas?\n\nSe eliminarán ${this._historiasGeneradas.length} historias.\n\n⚠️ Esta acción NO se puede deshacer.\n\n¿Continuar?`,
            '🧹 Limpiar Todas las Historias'
        );
        
        if (!confirmar) return;
        
        for (const historia of this._historiasGeneradas) {
            if (historia.id) {
                try {
                    const frases = await db.obtenerFrasesPorHistoria(historia.id);
                    for (const f of frases) {
                        await db.delete('frases', f.id);
                    }
                    await db.delete('historias', historia.id);
                } catch (e) {
                    console.warn(`⚠️ Error eliminando historia "${historia.titulo}":`, e);
                }
            }
        }
        
        this._historiasGeneradas = [];
        this._historiasGuardadas = {};
        this._historiasLeidas = new Set();
        this._paginaHistorias = 1;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        this._core?.mostrarToast('🧹 Todas las historias limpiadas correctamente', 'success');
        
        if (window.UIDashboard) {
            window.UIDashboard._cargarDashboardInicial(this._core);
        }
    }

    // ============================================================
    // USAR CARACTERES DE EJEMPLO
    // ============================================================

    _usarCaracteresEjemplo() {
        const ejemplos = this._generarCaracteresEjemplo();
        if (ejemplos.length > 0) {
            const c = ejemplos[0];
            this._seleccionarCaracterEspecifico(c.palabra, c.pinyin || '', c.significado || '');
            this._core?.mostrarToast(`🎵 Usando caracteres de ejemplo: "${c.palabra}"`, 'info');
        }
    }

    // ============================================================
    // SELECCIONAR CARÁCTER
    // ============================================================

    _seleccionarCaracterEspecifico(caracter, pinyin, significado) {
        console.log(`🎵 Seleccionando carácter: ${caracter} (${pinyin})`);
        
        this._caracterActual = caracter;
        this._paginaHistorias = 1;
        
        const savedState = localStorage.getItem(this._persistenciaKey);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.caracterActual === caracter && parsed.historiasGeneradas) {
                    this._historiasGeneradas = parsed.historiasGeneradas;
                    this._historiasGuardadas = parsed.historiasGuardadas || {};
                    this._historiasLeidas = new Set(parsed.historiasLeidas || []);
                    console.log(`💾 Restauradas ${this._historiasGeneradas.length} historias para "${caracter}"`);
                }
            } catch (e) {}
        }
        
        this._tonosData = this._obtenerDatosTonos(caracter, pinyin, significado);
        
        if (!this._tonosData || Object.keys(this._tonosData.tonos || {}).length === 0) {
            this._tonosData = this._obtenerDatosTonos(caracter, pinyin, significado);
        }
        
        this._renderizarPanel();
        this._core?.mostrarToast(`🎵 Carácter "${caracter}" seleccionado (${this._historiasGeneradas.length} historias)`, 'success');
    }

    _seleccionarCaracter() {
        const caracteresRaiz = this._caracteresRaizCache || this._generarCaracteresEjemplo();
        
        if (!caracteresRaiz || caracteresRaiz.length === 0) {
            this._core?.mostrarToast('❌ No hay caracteres raíz disponibles. Usando ejemplos.', 'warning');
            this._usarCaracteresEjemplo();
            return;
        }

        const opciones = caracteresRaiz.map((c, i) => {
            const palabra = c.palabra || c.hanzi || '?';
            const pinyin = c.pinyin || '';
            const significado = c.significado || palabra;
            return `${i + 1}. ${palabra} ${pinyin ? `(${pinyin})` : ''} - ${significado}`;
        }).join('\n');

        const seleccion = this._core?.prompt(
            `🀄 Selecciona un carácter raíz para estudiar sus tonos:\n\n${opciones}`,
            '1',
            'Número del carácter...',
            '🎵 Seleccionar Carácter'
        );

        if (seleccion) {
            const idx = parseInt(seleccion) - 1;
            if (!isNaN(idx) && idx >= 0 && idx < caracteresRaiz.length) {
                const c = caracteresRaiz[idx];
                this._seleccionarCaracterEspecifico(
                    c.palabra || c.hanzi || '?', 
                    c.pinyin || '', 
                    c.significado || ''
                );
            }
        }
    }

    _cambiarCaracter() {
        this._guardarEstadoCompleto();
        this._caracterActual = null;
        this._tonosData = null;
        this._paginaHistorias = 1;
        this._renderizarPanel();
    }

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    _calcularEstadisticas() {
        try {
            const caracteresRaiz = this._caracteresRaizCache || this._generarCaracteresEjemplo();
            const totalCaracteres = caracteresRaiz ? caracteresRaiz.length : 0;
            
            const historias = this._historiasGeneradas || [];
            const totalHistorias = historias.length;
            const totalGuardadas = Object.values(this._historiasGuardadas).filter(v => v).length;
            const totalLeidas = this._historiasLeidas.size;
            
            const nivel = this._obtenerNivelRealUsuario();
            
            return {
                totalCaracteres,
                totalHistorias,
                totalGuardadas,
                totalLeidas,
                nivelPromedio: nivel
            };
        } catch (e) {
            return { totalCaracteres: 0, totalHistorias: 0, totalGuardadas: 0, totalLeidas: 0, nivelPromedio: 'A1' };
        }
    }

    // ============================================================
    // CONTAINER
    // ============================================================

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
    // DESTRUIR
    // ============================================================

    destroy() {
        this._guardarEstadoCompleto();
        this._initDone = false;
        console.log('🛑 UI Tonos: Destruido (estado guardado)');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UITonos = new UITonos();

console.log('🎵 UI Estudio de Tonos v7.5 - COMPLETO CON ELIMINAR Y OCULTAR TRADUCCIÓN');
console.log('  🔥 Error "Frase no encontrada" CORREGIDO');
console.log('  🔥 Las frases se guardan en DB antes de estudiar');
console.log('  🔥 Títulos NATURALES y DESCRIPTIVOS para las historias');
console.log('  🔥 Botón "Eliminar" para borrar historias individualmente');
console.log('  🔥 Botón "Leer" para ver la historia completa con palabras desglosadas');
console.log('  🔥 Visor de historia tonal con checkbox "Ocultar/Mostrar traducción"');
console.log('  🔥 Al ocultar la traducción, el alumno practica comprensión lectora');
console.log('  🔥 Extracción automática de palabras de las frases al importar');
console.log('  🔥 Palabras guardadas en DB con pinyin, significado y tipo gramatical');
console.log('  🔥 Al hacer clic en una palabra, se abre modal para guardar en Mi Espacio');
console.log('  📖 Historias completas (8-10 frases por historia)');
console.log('  📄 Paginación de historias (3 por página)');
console.log('  ✅ Checkbox "Completada" con reset de RCN');
console.log('  ✅ Checkbox "Leída" para seguimiento');
console.log('  🔄 Botón "Volver a Historias Tonales" en Estudio');
console.log('  💾 Persistencia completa en localStorage');
console.log('  📝 Segmentación semántica de frases');
console.log('  🔤 Pinyin legible (14px)');