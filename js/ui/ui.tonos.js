// ============================================================
// UI ESTUDIO DE TONOS v7.8 - MULTIIDIOMA COMPLETO
// CON PERSISTENCIA MEJORADA Y CARGA ASÍNCRONA
// CORREGIDO: SEPARACIÓN DE HISTORIAS POR CARÁCTER RAIZ
// CORREGIDO: ERROR DE DB NO DISPONIBLE
// ============================================================

class UITonos {
    constructor() {
        this._core = null;
        this._container = null;
        this._initDone = false;
        this._caracterActual = null;
        this._tonosData = null;
        // ============================================================
        // CORRECCIÓN: historiasPorCaracter almacena historias indexadas por caracter raíz
        // ============================================================
        this._historiasPorCaracter = {};
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
        this._historiaEnEstudio = null;
        this._estudiandoHistoriaCompleta = false;
        this._botonInyectado = false;
        this._cargaInicialCompletada = false;
        
        // ============================================================
        // MULTIIDIOMA - DATOS POR IDIOMA
        // ============================================================
        this._datosPorIdioma = {};
        this._idiomaActual = null;
        this._persistenciaKey = 'pipeline_tonos_estado_v8';
        
        // ============================================================
        // DICCIONARIOS Y CONFIGURACIÓN
        // ============================================================
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
        for (var fsi = 0; fsi < this._FAMILIAS_SEMANTICAS.length; fsi++) {
            var familia = this._FAMILIAS_SEMANTICAS[fsi];
            for (var fci = 0; fci < familia.caracteres.length; fci++) {
                var c = familia.caracteres[fci];
                this._familiaMap[c] = familia.id;
            }
        }
        
        // ============================================================
        // CONFIGURAR LISTENER DE IDIOMA
        // ============================================================
        this._configurarListenerIdioma();
        
        // ============================================================
        // CARGAR ESTADO INICIAL DESDE LOCALSTORAGE + INDEXEDDB
        // ============================================================
        var idiomaInicial = this._obtenerIdiomaActual();
        this._idiomaActual = idiomaInicial;
        
        // Cargar desde localStorage primero (síncrono)
        var cargado = this._cargarEstadoPorIdioma(idiomaInicial);
        
        // Si no hay datos en localStorage, cargar desde IndexedDB (async)
        if (!cargado || Object.keys(this._historiasPorCaracter).length === 0) {
            console.log('🔄 Constructor: Cargando desde IndexedDB para idioma:', idiomaInicial);
            this._cargarDesdeIndexedDB(idiomaInicial).then(function(resultado) {
                if (resultado) {
                    var total = 0;
                    for (var key in this._historiasPorCaracter) {
                        total += this._historiasPorCaracter[key].length;
                    }
                    console.log('✅ Carga inicial desde IndexedDB completada: ' + total + ' historias');
                    this._cargaInicialCompletada = true;
                    if (this._container && this._container.offsetParent !== null) {
                        this._renderizarPanel();
                    }
                }
            }.bind(this));
        } else {
            this._cargaInicialCompletada = true;
        }
        
        // ============================================================
        // CONFIGURAR GUARDADO AUTOMÁTICO
        // ============================================================
        this._configurarGuardadoAutomatico();
    }
    
    // ============================================================
    // CONFIGURAR GUARDADO AUTOMÁTICO
    // ============================================================
    
    _configurarGuardadoAutomatico() {
        var self = this;
        
        window.addEventListener('beforeunload', function() {
            var idiomaActual = self._obtenerIdiomaActual();
            self._guardarEstadoPorIdioma(idiomaActual);
            self._guardarEnIndexedDB(idiomaActual);
        });
        
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                var idiomaActual = self._obtenerIdiomaActual();
                self._guardarEstadoPorIdioma(idiomaActual);
                self._guardarEnIndexedDB(idiomaActual);
            }
        });
        
        setInterval(function() {
            var idiomaActual = self._obtenerIdiomaActual();
            self._guardarEstadoPorIdioma(idiomaActual);
            self._guardarEnIndexedDB(idiomaActual);
        }, 30000);
        
        console.log('💾 UI Tonos: Guardado automático configurado (cada 30s, antes de cerrar, al ocultar)');
    }

    // ============================================================
    // CONFIGURAR LISTENER DE IDIOMA (MULTIIDIOMA)
    // ============================================================

    _configurarListenerIdioma() {
        window.removeEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        
        this._handleIdiomaCambiado = function(e) {
            var nuevoIdioma = e.detail?.idioma;
            var idiomaAnterior = e.detail?.idiomaAnterior;
            
            console.log('🎵 UI Tonos: Idioma cambiado de "' + idiomaAnterior + '" a "' + nuevoIdioma + '"');
            
            if (idiomaAnterior && this._idiomaActual !== nuevoIdioma) {
                console.log('💾 Guardando estado del idioma anterior: ' + idiomaAnterior);
                this._guardarEstadoPorIdioma(idiomaAnterior);
                this._guardarEnIndexedDB(idiomaAnterior);
            }
            
            this._idiomaActual = nuevoIdioma;
            console.log('📂 Cargando estado del idioma: ' + nuevoIdioma);
            var cargado = this._cargarEstadoPorIdioma(nuevoIdioma);
            if (!cargado || Object.keys(this._historiasPorCaracter).length === 0) {
                this._cargarDesdeIndexedDB(nuevoIdioma).then(function() {
                    if (this._container && this._container.offsetParent !== null) {
                        this._renderizarPanel();
                    }
                }.bind(this));
            }
            
            if (this._container && this._container.offsetParent !== null) {
                this._renderizarPanel();
            }
        }.bind(this);
        
        window.addEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        console.log('🎵 UI Tonos: Listener de idioma configurado (MULTIIDIOMA)');
    }

    // ============================================================
    // GUARDAR ESTADO POR IDIOMA
    // ============================================================

    _guardarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        try {
            var key = 'pipeline_tonos_estado_idioma_' + idioma;
            var data = {
                version: '7.8',
                timestamp: Date.now(),
                idioma: idioma,
                // CORRECCIÓN: Guardar historiasPorCaracter en lugar de historiasGeneradas
                historiasPorCaracter: this._historiasPorCaracter,
                historiasGuardadas: this._historiasGuardadas,
                historiasLeidas: Array.from(this._historiasLeidas),
                caracterActual: this._caracterActual,
                tonosData: this._tonosData,
                ocultarTraduccion: this._ocultarTraduccion,
                visorOcultarTraduccion: this._visorOcultarTraduccion,
                paginaActual: this._paginaActual,
                paginaHistorias: this._paginaHistorias,
                busqueda: this._busqueda,
                familiaSeleccionada: this._familiaSeleccionada
            };
            localStorage.setItem(key, JSON.stringify(data));
            console.log('💾 Estado de Tonos guardado en localStorage para idioma: ' + idioma + ' (' + Object.keys(this._historiasPorCaracter).length + ' caracteres)');
            
            this._datosPorIdioma[idioma] = data;
        } catch (e) {
            console.warn('⚠️ Error guardando estado de Tonos para idioma ' + idioma + ':', e);
        }
    }

    // ============================================================
    // GUARDAR EN INDEXEDDB
    // ============================================================

    async _guardarEnIndexedDB(idioma) {
        if (!idioma) return false;
        
        try {
            // CORRECCIÓN: Verificar si db está disponible correctamente
            if (typeof db === 'undefined' || !db || !db._initialized) {
                console.warn('⚠️ DB no disponible para guardar Tonos - intentando inicializar...');
                // Intentar inicializar db si es posible
                if (typeof inicializarDB === 'function') {
                    try {
                        await inicializarDB();
                        console.log('✅ DB inicializada correctamente');
                    } catch (e) {
                        console.warn('⚠️ No se pudo inicializar DB:', e);
                        return false;
                    }
                } else {
                    console.warn('⚠️ DB no disponible y no hay función para inicializar');
                    return false;
                }
            }

            var key = 'tonos_estado_' + idioma;
            var data = {
                version: '7.8',
                timestamp: Date.now(),
                idioma: idioma,
                historiasPorCaracter: this._historiasPorCaracter,
                historiasGuardadas: this._historiasGuardadas,
                historiasLeidas: Array.from(this._historiasLeidas),
                caracterActual: this._caracterActual,
                tonosData: this._tonosData,
                ocultarTraduccion: this._ocultarTraduccion,
                visorOcultarTraduccion: this._visorOcultarTraduccion,
                paginaActual: this._paginaActual,
                paginaHistorias: this._paginaHistorias,
                busqueda: this._busqueda,
                familiaSeleccionada: this._familiaSeleccionada
            };

            var guardadoExitoso = false;
            var intentos = 0;
            var maxIntentos = 3;

            while (!guardadoExitoso && intentos < maxIntentos) {
                try {
                    intentos++;
                    // Verificar que db tiene los métodos necesarios
                    if (!db.getByIndex || !db.update || !db.add) {
                        console.warn('⚠️ DB no tiene métodos completos');
                        return false;
                    }
                    var configs = await db.getByIndex('configuracion', 'clave', key);
                    
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
                    guardadoExitoso = true;
                } catch (e) {
                    console.warn('⚠️ Intento ' + intentos + ' falló en IndexedDB para Tonos:', e.message);
                    if (intentos < maxIntentos) {
                        await new Promise(function(r) { setTimeout(r, 500 * intentos); });
                    }
                }
            }

            if (guardadoExitoso) {
                var total = 0;
                for (var key2 in this._historiasPorCaracter) {
                    total += this._historiasPorCaracter[key2].length;
                }
                console.log('💾 Estado de Tonos guardado en IndexedDB para idioma: ' + idioma + ' (' + total + ' historias)');
            }
            return guardadoExitoso;

        } catch (error) {
            console.error('❌ Error guardando Tonos en IndexedDB:', error);
            return false;
        }
    }

    // ============================================================
    // CARGAR DESDE INDEXEDDB
    // ============================================================

    async _cargarDesdeIndexedDB(idioma) {
        if (!idioma) return false;
        
        try {
            // CORRECCIÓN: Verificar si db está disponible correctamente
            if (typeof db === 'undefined' || !db || !db._initialized) {
                console.warn('⚠️ DB no disponible para cargar Tonos - intentando inicializar...');
                if (typeof inicializarDB === 'function') {
                    try {
                        await inicializarDB();
                        console.log('✅ DB inicializada correctamente');
                    } catch (e) {
                        console.warn('⚠️ No se pudo inicializar DB:', e);
                        return false;
                    }
                } else {
                    console.warn('⚠️ DB no disponible y no hay función para inicializar');
                    return false;
                }
            }

            var key = 'tonos_estado_' + idioma;
            // Verificar que db tiene los métodos necesarios
            if (!db.getByIndex) {
                console.warn('⚠️ DB no tiene método getByIndex');
                return false;
            }
            var configs = await db.getByIndex('configuracion', 'clave', key);
            
            if (configs && configs.length > 0 && configs[0].valor) {
                var data = JSON.parse(configs[0].valor);
                var total = 0;
                for (var key2 in (data.historiasPorCaracter || {})) {
                    total += data.historiasPorCaracter[key2].length;
                }
                console.log('📦 Cargando datos de Tonos desde IndexedDB para idioma: ' + idioma);
                console.log('   📊 ' + total + ' historias');
                
                this._aplicarDatos(data);
                this._datosPorIdioma[idioma] = data;
                
                var localStorageKey = 'pipeline_tonos_estado_idioma_' + idioma;
                localStorage.setItem(localStorageKey, JSON.stringify(data));
                
                console.log('✅ Datos cargados desde IndexedDB: ' + total + ' historias');
                return true;
            }
            
            console.log('📭 No hay datos de Tonos en IndexedDB para idioma: ' + idioma);
            return false;
            
        } catch (error) {
            console.warn('⚠️ Error cargando Tonos desde IndexedDB para ' + idioma + ':', error.message);
            return false;
        }
    }

    // ============================================================
    // CARGAR ESTADO POR IDIOMA (DESDE LOCALSTORAGE)
    // ============================================================

    _cargarEstadoPorIdioma(idioma) {
        if (!idioma) return false;
        
        if (this._datosPorIdioma[idioma]) {
            console.log('📦 Cargando datos de Tonos desde caché para idioma: ' + idioma);
            var data = this._datosPorIdioma[idioma];
            this._aplicarDatos(data);
            return true;
        }
        
        try {
            var key = 'pipeline_tonos_estado_idioma_' + idioma;
            var stored = localStorage.getItem(key);
            if (stored) {
                var parsed = JSON.parse(stored);
                var total = 0;
                for (var key2 in (parsed.historiasPorCaracter || {})) {
                    total += parsed.historiasPorCaracter[key2].length;
                }
                console.log('📦 Cargando datos de Tonos desde localStorage para idioma: ' + idioma);
                console.log('   📊 ' + total + ' historias');
                
                this._aplicarDatos(parsed);
                this._datosPorIdioma[idioma] = parsed;
                return true;
            }
            
            console.log('📭 No hay datos de Tonos en localStorage para idioma: ' + idioma);
            this._inicializarVacio();
            return false;
            
        } catch (e) {
            console.warn('⚠️ Error cargando estado de Tonos para idioma ' + idioma + ':', e);
            this._inicializarVacio();
            return false;
        }
    }

    // ============================================================
    // APLICAR DATOS
    // ============================================================

    _aplicarDatos(data) {
        if (!data) return;
        
        // CORRECCIÓN: Usar historiasPorCaracter
        this._historiasPorCaracter = data.historiasPorCaracter || {};
        this._historiasGuardadas = data.historiasGuardadas || {};
        this._historiasLeidas = new Set(data.historiasLeidas || []);
        this._caracterActual = data.caracterActual || null;
        this._tonosData = data.tonosData || null;
        this._ocultarTraduccion = data.ocultarTraduccion || false;
        this._visorOcultarTraduccion = data.visorOcultarTraduccion || false;
        this._paginaActual = data.paginaActual || 1;
        this._paginaHistorias = data.paginaHistorias || 1;
        this._busqueda = data.busqueda || '';
        this._familiaSeleccionada = data.familiaSeleccionada || 'todas';
        
        this._tonosCache = {};
        
        if (this._caracterActual && data.tonosData) {
            this._tonosData = data.tonosData;
        }
        
        var total = 0;
        for (var key in this._historiasPorCaracter) {
            total += this._historiasPorCaracter[key].length;
        }
        console.log('✅ Datos aplicados: ' + total + ' historias');
    }

    // ============================================================
    // INICIALIZAR VACÍO
    // ============================================================

    _inicializarVacio() {
        this._historiasPorCaracter = {};
        this._historiasGuardadas = {};
        this._historiasLeidas = new Set();
        this._caracterActual = null;
        this._tonosData = null;
        this._tonosCache = {};
        this._paginaActual = 1;
        this._paginaHistorias = 1;
        this._busqueda = '';
        this._familiaSeleccionada = 'todas';
    }

    // ============================================================
    // OBTENER IDIOMA ACTUAL
    // ============================================================

    _obtenerIdiomaActual() {
        try {
            return gestorIdiomas?.getIdiomaActivo() || 'zh';
        } catch (e) {
            return 'zh';
        }
    }

    // ============================================================
    // VERIFICAR SI ES TONAL
    // ============================================================

    _esTonal(idioma) {
        if (!idioma) return false;
        var idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_TONALES.some(function(item) {
            return idiomaLower.includes(item) || item.includes(idiomaLower);
        });
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _getNombreIdioma(idioma) {
        var nombres = {
            'es': 'Español', 'en': 'Inglés', 'fr': 'Francés',
            'de': 'Alemán', 'it': 'Italiano', 'pt': 'Portugués',
            'zh': 'Chino', 'ja': 'Japonés', 'ko': 'Coreano',
            'ru': 'Ruso', 'ar': 'Árabe', 'hi': 'Hindi'
        };
        return nombres[idioma] || idioma;
    }

    _obtenerNivelRealUsuario() {
        try {
            var infoActivo = window.gestorIdiomas?.getInfoActivo?.();
            if (infoActivo?.nivel) return infoActivo.nivel;
            var usuarioLocal = localStorage.getItem('pipeline_usuario');
            if (usuarioLocal) {
                var parsed = JSON.parse(usuarioLocal);
                var idiomaActivo = window.gestorIdiomas?.getIdiomaActivo?.() || 'zh';
                var idiomaObj = parsed.idiomasObjetivo?.find(function(i) { return i.idioma === idiomaActivo; });
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
            var usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
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
        var f = this._FAMILIAS_SEMANTICAS.find(function(fam) { return fam.id === familiaId; });
        return f ? f.nombre : '📂 Otras';
    }

    // ============================================================
    // SEGMENTACIÓN SEMÁNTICA
    // ============================================================

    _segmentarFrase(hanzi, pinyin) {
        if (!hanzi) return { segmentos: [], pinyinSegmentos: [], esPalabra: [] };

        if (pinyin && pinyin.includes(' ')) {
            var pinyinPalabras = pinyin.split(/\s+/);
            var resultado = this._segmentarConPinyinYDiccionario(hanzi, pinyinPalabras);
            if (resultado.segmentos.length > 0) {
                return resultado;
            }
        }
        return this._segmentarPorDiccionario(hanzi);
    }

    _segmentarConPinyinYDiccionario(hanzi, pinyinPalabras) {
        var segmentos = [];
        var pinyinSegmentos = [];
        var esPalabra = [];

        var i = 0;
        var pIdx = 0;

        while (i < hanzi.length && pIdx < pinyinPalabras.length) {
            if (i + 2 < hanzi.length) {
                var tres = hanzi.substring(i, i + 3);
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
                var dos = hanzi.substring(i, i + 2);
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

        return { segmentos: segmentos, pinyinSegmentos: pinyinSegmentos, esPalabra: esPalabra };
    }

    _segmentarPorDiccionario(hanzi) {
        var segmentos = [];
        var pinyinSegmentos = [];
        var esPalabra = [];

        var i = 0;
        while (i < hanzi.length) {
            if (i + 2 < hanzi.length) {
                var tres = hanzi.substring(i, i + 3);
                if (this._DICCIONARIO[tres]) {
                    segmentos.push(tres);
                    pinyinSegmentos.push(this._DICCIONARIO[tres]);
                    esPalabra.push(true);
                    i += 3;
                    continue;
                }
            }

            if (i + 1 < hanzi.length) {
                var dos = hanzi.substring(i, i + 2);
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

        return { segmentos: segmentos, pinyinSegmentos: pinyinSegmentos, esPalabra: esPalabra };
    }

    _renderizarFraseSegmentada(hanzi, pinyin, tono) {
        var segmentacion = this._segmentarFrase(hanzi, pinyin);
        var segmentos = segmentacion.segmentos;
        var pinyinSegmentos = segmentacion.pinyinSegmentos;
        var esPalabra = segmentacion.esPalabra;
        var tonoColor = this._getColorTono(tono);
        var caracterTono = this._caracterActual || '';
        
        var html = '<div style="display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;padding:6px 0;">';
        
        for (var i = 0; i < segmentos.length; i++) {
            var seg = segmentos[i];
            var py = pinyinSegmentos[i] || '';
            var esPal = esPalabra[i] || false;
            var contieneTono = seg.includes(caracterTono);
            
            var bgColor = contieneTono ? tonoColor + '25' : (esPal ? tonoColor + '10' : 'transparent');
            var borderColor = contieneTono ? tonoColor + '50' : (esPal ? tonoColor + '25' : 'none');
            var borderWidth = contieneTono ? '2px' : (esPal ? '1px' : '0px');
            var fontWeight = contieneTono ? '700' : (esPal ? '600' : '400');
            var textColor = contieneTono ? tonoColor : (esPal ? 'var(--dark)' : 'var(--dark)');
            var fontSize = segmentos.length > 8 ? '20px' : '24px';
            var pinyinSize = '14px';
            var esPalabraMultiple = seg.length >= 2;
            var padding = esPalabraMultiple ? '4px 14px' : '2px 10px';
            var borderRadius = esPalabraMultiple ? '10px' : '6px';
            
            html += '<span style="display:inline-flex;flex-direction:column;align-items:center;padding:' + padding + ';border-radius:' + borderRadius + ';background:' + bgColor + ';border:' + borderWidth + ' solid ' + borderColor + ';cursor:default;transition:all 0.2s;' + (esPalabraMultiple ? 'box-shadow: 0 1px 6px rgba(0,0,0,0.06);' : '') + '">';
            html += '<span style="font-size:' + fontSize + ';font-weight:' + fontWeight + ';color:' + textColor + ';' + (esPalabraMultiple ? 'letter-spacing:0.5px;' : '') + '">' + seg + '</span>';
            if (py) {
                html += '<span style="font-size:' + pinyinSize + ';color:' + (contieneTono ? tonoColor : 'var(--gray-light)') + ';letter-spacing:0.5px;margin-top:2px;font-weight:' + (contieneTono ? '600' : '400') + ';">' + py + '</span>';
            }
            if (esPalabraMultiple && !contieneTono) {
                html += '<span style="font-size:8px;color:var(--gray-light);margin-top:1px;opacity:0.6;">' + seg.length + ' car.</span>';
            }
            html += '</span>';
        }
        
        html += '</div>';
        return html;
    }

    // ============================================================
    // OBTENER CARACTERES RAÍZ (CON IDIOMA)
    // ============================================================

    async _obtenerCaracteresRaiz(idioma) {
        if (this._caracteresRaizCache && 
            this._ultimaCargaCaracteres > 0 && 
            (Date.now() - this._ultimaCargaCaracteres) < this._tiempoCacheCaracteres) {
            return this._caracteresRaizCache;
        }

        if (this._cargandoCaracteres) {
            await new Promise(function(resolve) {
                var check = function() {
                    if (!this._cargandoCaracteres) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                }.bind(this);
                check();
            }.bind(this));
            return this._caracteresRaizCache || this._generarCaracteresEjemplo();
        }

        this._cargandoCaracteres = true;
        
        try {
            var palabras = [];
            
            if (db && typeof db.obtenerPalabrasPorIdioma === 'function') {
                try {
                    var resultado = await db.obtenerPalabrasPorIdioma(idioma);
                    if (Array.isArray(resultado) && resultado.length > 0) {
                        palabras = resultado;
                    }
                } catch (e) {
                    console.warn('⚠️ Error en db.obtenerPalabrasPorIdioma:', e);
                }
            }
            
            if (palabras.length === 0 && db && typeof db.obtenerFamiliasCaracteres === 'function') {
                try {
                    var familias = await db.obtenerFamiliasCaracteres(idioma);
                    if (Array.isArray(familias) && familias.length > 0) {
                        for (var fi = 0; fi < familias.length; fi++) {
                            var f = familias[fi];
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
                var ejemplos = this._generarCaracteresEjemplo();
                this._caracteresRaizCache = ejemplos;
                this._ultimaCargaCaracteres = Date.now();
                return ejemplos;
            }
            
            var caracteresRaiz = palabras.filter(function(p) {
                return p.esCaracterRaiz === true || 
                    (p.palabra && p.palabra.length === 1) ||
                    (p.hanzi && p.hanzi.length === 1);
            });
            
            if (caracteresRaiz.length === 0) {
                var palabrasCortas = palabras.filter(function(p) {
                    return (p.palabra && p.palabra.length === 1) || 
                        (p.hanzi && p.hanzi.length === 1);
                });
                if (palabrasCortas.length > 0) {
                    this._caracteresRaizCache = palabrasCortas;
                    this._ultimaCargaCaracteres = Date.now();
                    return palabrasCortas;
                }
                var ejemplos2 = this._generarCaracteresEjemplo();
                this._caracteresRaizCache = ejemplos2;
                this._ultimaCargaCaracteres = Date.now();
                return ejemplos2;
            }
            
            for (var ci = 0; ci < caracteresRaiz.length; ci++) {
                var c = caracteresRaiz[ci];
                var palabra = c.palabra || c.hanzi || '';
                c._familia = this._getFamiliaCaracter(palabra);
                c._familiaNombre = this._getNombreFamilia(c._familia);
            }
            
            this._caracteresRaizCache = caracteresRaiz;
            this._ultimaCargaCaracteres = Date.now();
            return caracteresRaiz;
            
        } catch (error) {
            console.error('❌ Error obteniendo caracteres raíz:', error);
            var ejemplos3 = this._generarCaracteresEjemplo();
            this._caracteresRaizCache = ejemplos3;
            this._ultimaCargaCaracteres = Date.now();
            return ejemplos3;
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

        var tonos = {};
        var caracteresRaiz = this._caracteresRaizCache || this._generarCaracteresEjemplo();
        var caracterObj = caracteresRaiz.find(function(c) { return c.palabra === caracter || c.hanzi === caracter; });
        
        if (caracterObj && caracterObj.tonos) {
            for (var ti = 0; ti < caracterObj.tonos.length; ti++) {
                var t = caracterObj.tonos[ti];
                tonos[t] = {
                    caracter: caracter,
                    pinyin: t,
                    significado: significado || caracter,
                    traduccion: this.TONOS_DESCRIPCION[t] || ''
                };
            }
        } else {
            var tonosBase = this.TONOS;
            for (var tbi = 0; tbi < tonosBase.length; tbi++) {
                var tb = tonosBase[tbi];
                tonos[tb] = {
                    caracter: caracter,
                    pinyin: tb,
                    significado: significado || caracter,
                    traduccion: this.TONOS_DESCRIPCION[tb] || ''
                };
            }
        }

        var result = {
            caracter: caracter,
            pinyin: pinyin || '',
            significado: significado || '',
            tonos: tonos
        };

        this._tonosCache[caracter] = result;
        return result;
    }

    _tieneTonos(caracter) {
        var data = this._obtenerDatosTonos(caracter.palabra, caracter.pinyin || '', caracter.significado || '');
        return data && Object.keys(data.tonos || {}).length > 0;
    }

    _contarTonos(caracter) {
        var data = this._obtenerDatosTonos(caracter.palabra, caracter.pinyin || '', caracter.significado || '');
        return data ? Object.keys(data.tonos || {}).length : 0;
    }

    // ============================================================
    // FILTRAR CARACTERES
    // ============================================================

    _filtrarCaracteres(caracteres) {
        var resultado = [...caracteres];
        
        if (this._busqueda) {
            var busquedaLower = this._busqueda.toLowerCase();
            resultado = resultado.filter(function(c) {
                var palabra = c.palabra || c.hanzi || '';
                var significado = c.significado || '';
                var pinyin = c.pinyin || '';
                return palabra.includes(busquedaLower) || 
                       significado.toLowerCase().includes(busquedaLower) ||
                       pinyin.includes(busquedaLower);
            });
        }
        
        if (this._familiaSeleccionada !== 'todas') {
            resultado = resultado.filter(function(c) {
                var familia = c._familia || this._getFamiliaCaracter(c.palabra || c.hanzi || '');
                return familia === this._familiaSeleccionada;
            }.bind(this));
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
        
        var idiomaActual = this._obtenerIdiomaActual();
        this._idiomaActual = idiomaActual;
        
        var cargado = this._cargarEstadoPorIdioma(idiomaActual);
        
        if (!cargado || Object.keys(this._historiasPorCaracter).length === 0) {
            console.log('🔄 init(): Cargando desde IndexedDB para idioma:', idiomaActual);
            await this._cargarDesdeIndexedDB(idiomaActual);
        }
        
        this._cargaInicialCompletada = true;
        
        var total = 0;
        for (var key in this._historiasPorCaracter) {
            total += this._historiasPorCaracter[key].length;
        }
        console.log('🎵 UI Tonos v7.8: Inicializado (MULTIIDIOMA)');
        console.log('   📊 ' + total + ' historias para idioma: ' + idiomaActual);
        console.log('   💾 Datos cargados: ' + (this._datosPorIdioma[idiomaActual] ? '✅ Sí' : '❌ No'));
        
        if (total > 0) {
            console.log('   📖 Renderizando ' + total + ' historias');
        }
        
        return this;
    }

    async cargar(core) {
        this._core = core || this._core;
        this._idiomaActual = this._obtenerIdiomaActual();
        
        var cargado = this._cargarEstadoPorIdioma(this._idiomaActual);
        
        if (!cargado || Object.keys(this._historiasPorCaracter).length === 0) {
            console.log('🔄 cargar(): Cargando desde IndexedDB para idioma:', this._idiomaActual);
            await this._cargarDesdeIndexedDB(this._idiomaActual);
        }
        
        this._cargaInicialCompletada = true;
        this._renderizarPanel();
    }

    // ============================================================
    // PERSISTENCIA (MANTENIDA PARA COMPATIBILIDAD)
    // ============================================================

    _guardarEstadoCompleto() {
        var idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
        this._guardarEnIndexedDB(idiomaActual);
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL
    // ============================================================

    _renderizarPanel() {
        var container = this._getContainer();
        if (!container) {
            console.warn('⚠️ Container no encontrado para Tonos');
            return;
        }

        if (this._visorAbierto) {
            return;
        }

        var idiomaActivo = this._obtenerIdiomaActual();
        var nombreIdioma = this._getNombreIdioma(idiomaActivo);
        var esTonal = this._esTonal(idiomaActivo);

        if (!esTonal) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">' +
                '<div style="font-size:64px;margin-bottom:16px;">🎵</div>' +
                '<h3 style="font-size:20px;font-weight:700;color:var(--dark);">El idioma <strong>' + nombreIdioma + '</strong> no es tonal</h3>' +
                '<p style="font-size:14px;color:var(--gray-light);">El estudio de tonos está diseñado para idiomas tonales como Chino, Tailandés o Vietnamita.</p>' +
                '<button class="btn-primary" onclick="window.uiCore.volverDashboard()" style="margin-top:12px;"><i class="fas fa-arrow-left"></i> Volver al Dashboard</button>' +
                '</div>';
            return;
        }

        if (!this._caracteresRaizCache) {
            this._obtenerCaracteresRaiz(idiomaActivo).then(function(caracteresRaiz) {
                this._caracteresRaizCache = caracteresRaiz;
                this._renderizarPanelConCaracteres(caracteresRaiz);
            }.bind(this))['catch'](function(error) {
                console.error('❌ Error obteniendo caracteres raíz:', error);
                container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--gray);">' +
                    '<i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>' +
                    '<p style="font-size:16px;font-weight:500;">Error al cargar los caracteres</p>' +
                    '<p style="font-size:13px;color:var(--gray-light);">' + error.message + '</p>' +
                    '<button class="btn-primary" onclick="window.UITonos._renderizarPanel()" style="margin-top:12px;padding:8px 20px;"><i class="fas fa-sync"></i> Reintentar</button>' +
                    '</div>';
            });
            return;
        }
        
        this._renderizarPanelConCaracteres(this._caracteresRaizCache);
    }

    _renderizarPanelConCaracteres(caracteresRaiz) {
        var container = this._getContainer();
        if (!container) return;
        
        var idiomaActivo = this._obtenerIdiomaActual();
        var nombreIdioma = this._getNombreIdioma(idiomaActivo);
        var nivelActual = this._obtenerNivelRealUsuario();
        var esTonal = this._esTonal(idiomaActivo);

        if (!esTonal) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">' +
                '<div style="font-size:64px;margin-bottom:16px;">🎵</div>' +
                '<h3 style="font-size:20px;font-weight:700;color:var(--dark);">El idioma <strong>' + nombreIdioma + '</strong> no es tonal</h3>' +
                '<p style="font-size:14px;color:var(--gray-light);">El estudio de tonos está diseñado para idiomas tonales como Chino, Tailandés o Vietnamita.</p>' +
                '<button class="btn-primary" onclick="window.uiCore.volverDashboard()" style="margin-top:12px;"><i class="fas fa-arrow-left"></i> Volver al Dashboard</button>' +
                '</div>';
            return;
        }

        var caracteresFiltrados = this._filtrarCaracteres(caracteresRaiz);

        var html = '<div class="tonos-container" style="padding:16px;">';
        
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">';
        html += '<div><h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">🎵 Estudio de Tonos <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">' + nombreIdioma + '</span><span style="font-size:11px;font-weight:400;color:var(--success);margin-left:8px;">🔊 Tonal</span>';
        var totalHistorias = 0;
        for (var key in this._historiasPorCaracter) {
            totalHistorias += this._historiasPorCaracter[key].length;
        }
        html += '<span style="font-size:10px;color:var(--info);margin-left:8px;">💾 ' + totalHistorias + ' historias</span></h2>';
        html += '<p style="font-size:13px;color:var(--gray);margin:4px 0 0;">Nivel <strong>' + nivelActual + '</strong> · ' + caracteresRaiz.length + ' caracteres raíz disponibles <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">📖 ' + this._historiasLeidas.size + ' leídas</span><span style="font-size:11px;color:var(--primary);margin-left:8px;">💾 ' + totalHistorias + ' historias</span><span style="font-size:10px;color:var(--secondary);margin-left:8px;">🌍 ' + idiomaActivo + '</span></p></div>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
        html += '<button class="btn-secondary" onclick="window.uiCore.volverDashboard()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;"><i class="fas fa-home"></i> Dashboard</button>';
        html += '<button class="btn-primary" onclick="window.UITonos._seleccionarCaracter()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-search"></i> Seleccionar Carácter</button>';
        html += '<button class="btn-success" onclick="window.UITonos._generarHistoriaTonos()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-file-export"></i> Generar JSON</button>';
        html += '<button class="btn-secondary" onclick="window.UITonos._toggleOcultarTraduccion()" style="padding:6px 14px;font-size:12px;background:' + (this._ocultarTraduccion ? 'var(--warning)' : 'var(--bg)') + ';color:' + (this._ocultarTraduccion ? 'var(--dark)' : 'var(--gray)') + ';border:1px solid var(--light);border-radius:6px;cursor:pointer;">' + (this._ocultarTraduccion ? '👁️ Mostrar traducción' : '🔒 Ocultar traducción') + '</button>';
        if (totalHistorias > 0) {
            html += '<button class="btn-danger" onclick="window.UITonos._limpiarHistorias()" style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-trash"></i> Limpiar Todo</button>';
        }
        html += '</div></div>';

        if (this._caracterActual && this._tonosData) {
            html += this._renderizarEstudioTonos();
        } else {
            html += this._renderizarSeleccionCaracter(caracteresFiltrados, caracteresRaiz);
        }

        var estadisticas = this._calcularEstadisticas();
        html += '<div style="margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--gray);">';
        html += '<span>🎵 ' + estadisticas.totalCaracteres + ' caracteres raíz</span>';
        html += '<span>📝 ' + estadisticas.totalHistorias + ' historias</span>';
        html += '<span>⭐ ' + estadisticas.totalGuardadas + ' guardadas</span>';
        html += '<span>📖 ' + this._historiasLeidas.size + ' leídas</span>';
        html += '<span>🎯 Nivel ' + estadisticas.nivelPromedio + '</span>';
        html += '<span>🔊 ' + this._getNombreIdioma(idiomaActivo) + ' es tonal</span>';
        html += '<span>🌍 ' + idiomaActivo + '</span>';
        html += '</div></div>';

        container.innerHTML = html;
    }

    // ============================================================
    // RENDERIZAR SELECCIÓN DE CARÁCTER
    // ============================================================

    _renderizarSeleccionCaracter(caracteresFiltrados, caracteresRaiz) {
        if (!caracteresRaiz || caracteresRaiz.length === 0) {
            return '<div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">' +
                '<div style="font-size:48px;margin-bottom:16px;">🀄</div>' +
                '<p style="font-size:16px;font-weight:500;">No hay caracteres raíz disponibles para ' + this._getNombreIdioma(this._idiomaActual) + '</p>' +
                '<p style="font-size:13px;color:var(--gray-light);">Importa o genera contenido en el módulo <strong>Caracteres</strong> primero.</p>' +
                '<button class="btn-primary" onclick="window.uiCore.irAModulo(\'caracteres\')" style="margin-top:12px;padding:8px 20px;"><i class="fas fa-arrow-right"></i> Ir a Caracteres</button>' +
                '<button class="btn-secondary" onclick="window.UITonos._usarCaracteresEjemplo()" style="margin-top:12px;padding:8px 20px;margin-left:8px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-lightbulb"></i> Usar Ejemplos</button>' +
                '</div>';
        }

        var totalItems = caracteresFiltrados.length;
        var totalPaginas = Math.max(1, Math.ceil(totalItems / this._itemsPorPagina));
        if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
        if (this._paginaActual < 1) this._paginaActual = 1;
        
        var inicio = (this._paginaActual - 1) * this._itemsPorPagina;
        var fin = Math.min(inicio + this._itemsPorPagina, totalItems);
        var itemsPagina = caracteresFiltrados.slice(inicio, fin);

        var familiasDisponibles = new Set();
        for (var ci = 0; ci < caracteresRaiz.length; ci++) {
            var c = caracteresRaiz[ci];
            var palabra = c.palabra || c.hanzi || '';
            var familia = c._familia || this._getFamiliaCaracter(palabra);
            if (familia && familia !== 'otras') {
                familiasDisponibles.add(familia);
            }
        }

        var html = '<div style="background:var(--white);border-radius:12px;padding:16px 20px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">';
        html += '<h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">🀄 Selecciona un carácter raíz para estudiar sus tonos <span style="font-size:12px;font-weight:400;color:var(--gray-light);">(' + totalItems + ' caracteres)</span><span style="font-size:10px;color:var(--secondary);margin-left:8px;">🌍 ' + this._idiomaActual + '</span></h3>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
        html += '<div style="position:relative;"><i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray);font-size:12px;"></i><input type="text" id="buscarTonosInput" placeholder="🔍 Buscar..." value="' + this._busqueda + '" style="padding:6px 10px 6px 30px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);width:140px;" oninput="window.UITonos._buscarCaracteres(this.value)"></div>';
        html += '<select id="familiaFiltro" onchange="window.UITonos._filtrarPorFamilia(this.value)" style="padding:6px 10px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);background:var(--white);">';
        html += '<option value="todas">📂 Todas las familias</option>';
        var familiasArray = Array.from(familiasDisponibles).sort();
        for (var fi = 0; fi < familiasArray.length; fi++) {
            var f = familiasArray[fi];
            var nombre = this._getNombreFamilia(f);
            html += '<option value="' + f + '" ' + (this._familiaSeleccionada === f ? 'selected' : '') + '>' + nombre + '</option>';
        }
        html += '</select></div></div>';
        
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;">';
        for (var ipi = 0; ipi < itemsPagina.length; ipi++) {
            var c2 = itemsPagina[ipi];
            var tieneTonos = this._tieneTonos(c2);
            var tonosCount = this._contarTonos(c2);
            var palabra2 = c2.palabra || c2.hanzi || '?';
            var pinyin2 = c2.pinyin || '';
            var significado2 = c2.significado || palabra2;
            var familia2 = c2._familiaNombre || this._getNombreFamilia(c2._familia || this._getFamiliaCaracter(palabra2));
            
            // CORRECCIÓN: Mostrar cuántas historias tiene este carácter
            var historiasParaCaracter = this._historiasPorCaracter[palabra2] || [];
            var numHistorias = historiasParaCaracter.length;
            
            html += '<div style="background:' + (tieneTonos ? 'var(--bg)' : 'var(--bg)') + ';border-radius:10px;padding:10px 12px;border:2px solid ' + (tieneTonos ? 'var(--success)' : 'var(--light)') + ';cursor:pointer;transition:all 0.3s;" onclick="window.UITonos._seleccionarCaracterEspecifico(\'' + palabra2 + '\', \'' + pinyin2 + '\', \'' + significado2 + '\')" onmouseover="this.style.transform=\'scale(1.03)\';this.style.boxShadow=\'0 2px 16px rgba(0,0,0,0.1)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'none\'">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:28px;font-weight:700;color:var(--dark);">' + palabra2 + '</span>' + (tieneTonos ? '<span style="font-size:11px;color:var(--success);">✅ ' + tonosCount + '</span>' : '<span style="font-size:11px;color:var(--gray-light);">⚠️</span>') + '</div>';
            html += '<div style="font-size:12px;color:var(--gray);">' + significado2 + '</div>';
            if (pinyin2) html += '<div style="font-size:11px;color:var(--gray-light);">🔊 ' + pinyin2 + '</div>';
            html += '<div style="font-size:9px;color:var(--gray-light);margin-top:2px;">' + familia2 + ' · 📖 ' + numHistorias + ' historias</div>';
            html += '</div>';
        }
        html += '</div>';
        
        if (totalPaginas > 1) {
            html += '<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">';
            html += '<button class="btn-secondary" onclick="window.UITonos._irPagina(' + (this._paginaActual - 1) + ')" style="padding:4px 12px;font-size:11px;' + (this._paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : '') + '" ' + (this._paginaActual <= 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
            html += '<span style="font-size:12px;color:var(--gray);">' + this._paginaActual + ' / ' + totalPaginas + '</span>';
            html += '<button class="btn-secondary" onclick="window.UITonos._irPagina(' + (this._paginaActual + 1) + ')" style="padding:4px 12px;font-size:11px;' + (this._paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : '') + '" ' + (this._paginaActual >= totalPaginas ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
            html += '</div>';
        }
        
        html += '<div style="margin-top:8px;font-size:10px;color:var(--gray-light);text-align:center;">💡 Los caracteres con ✅ tienen datos de tonos. Haz clic para estudiarlos.' + (this._busqueda ? ' · 🔎 ' + totalItems + ' resultados para "' + this._busqueda + '"' : '') + '</div>';
        html += '</div>';

        return html;
    }

    // ============================================================
    // RENDERIZAR ESTUDIO DE TONOS
    // ============================================================

    _renderizarEstudioTonos() {
        var caracter = this._caracterActual;
        var tonosData = this._tonosData;
        // CORRECCIÓN: Obtener historias solo para este carácter
        var historias = this._historiasPorCaracter[caracter] || [];
        var idiomaNativo = this._obtenerIdiomaNativo();

        var totalHistorias = historias.length;
        var totalPaginasHistorias = Math.max(1, Math.ceil(totalHistorias / this._historiasPorPagina));
        if (this._paginaHistorias > totalPaginasHistorias) this._paginaHistorias = totalPaginasHistorias;
        if (this._paginaHistorias < 1) this._paginaHistorias = 1;
        
        var inicioHistorias = (this._paginaHistorias - 1) * this._historiasPorPagina;
        var finHistorias = Math.min(inicioHistorias + this._historiasPorPagina, totalHistorias);
        var historiasPagina = historias.slice(inicioHistorias, finHistorias);

        var totalLeidas = 0;
        for (var hi = 0; hi < historias.length; hi++) {
            if (this._historiasLeidas.has('historia_' + caracter + '_' + hi)) totalLeidas++;
        }

        var html = '<div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">';
        html += '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:48px;font-weight:800;color:var(--dark);">' + caracter + '</span>';
        html += '<div><div style="font-size:16px;font-weight:600;color:var(--dark);">' + caracter + ' - Diferentes tonos</div>';
        html += '<div style="font-size:12px;color:var(--gray);">' + (tonosData.significado || 'Significado base') + '</div>';
        html += '<div style="font-size:10px;color:var(--gray-light);">💾 ' + historias.length + ' historias</div></div></div>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
        html += '<button class="btn-secondary" onclick="window.UITonos._cambiarCaracter()" style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;"><i class="fas fa-undo"></i> Cambiar</button>';
        html += '<button class="btn-primary" onclick="window.UITonos._generarHistoriaTonos()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-magic"></i> Generar Historia</button>';
        html += '<button class="btn-success" onclick="window.UITonos._guardarTodasHistorias()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-save"></i> Guardar Todas</button>';
        html += '<button class="btn-secondary" onclick="window.UITonos._toggleOcultarTraduccion()" style="padding:4px 14px;font-size:11px;background:' + (this._ocultarTraduccion ? 'var(--warning)' : 'var(--bg)') + ';border:1px solid var(--light);border-radius:4px;cursor:pointer;">' + (this._ocultarTraduccion ? '🔒' : '👁️') + '</button>';
        html += '</div></div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:16px;">';
        var tonosKeys = Object.keys(tonosData.tonos || {});
        for (var tki = 0; tki < tonosKeys.length; tki++) {
            var tono = tonosKeys[tki];
            var info = tonosData.tonos[tono];
            html += '<div style="background:var(--bg);border-radius:8px;padding:8px 12px;text-align:center;border:2px solid ' + this._getColorTono(tono) + ';">';
            html += '<div style="font-size:24px;font-weight:700;color:' + this._getColorTono(tono) + ';">' + (info.caracter || '?') + '</div>';
            html += '<div style="font-size:14px;color:var(--gray-light);">' + tono + '</div>';
            html += '<div style="font-size:10px;color:var(--gray);">' + (info.traduccion || this.TONOS_DESCRIPCION[tono] || '') + '</div>';
            html += '<div style="font-size:9px;color:var(--gray-light);margin-top:2px;">' + (info.significado || caracter) + '</div>';
            html += '</div>';
        }
        html += '</div>';

        if (historias.length > 0) {
            html += '<div style="margin-top:12px;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;"><h4 style="font-size:14px;font-weight:600;color:var(--dark);margin:0;">📖 Historias generadas para "' + caracter + '" (' + historias.length + ')</h4><span style="font-size:10px;color:var(--success);">✅ ' + totalLeidas + ' leídas</span>' + (totalPaginasHistorias > 1 ? '<span style="font-size:10px;color:var(--gray-light);">· Página ' + this._paginaHistorias + '/' + totalPaginasHistorias + '</span>' : '') + '</div>';
            html += '<div style="display:flex;gap:6px;">';
            if (totalPaginasHistorias > 1) {
                html += '<button class="btn-secondary" onclick="window.UITonos._irPaginaHistorias(' + (this._paginaHistorias - 1) + ')" style="padding:2px 10px;font-size:10px;' + (this._paginaHistorias <= 1 ? 'opacity:0.5;cursor:default;' : '') + '" ' + (this._paginaHistorias <= 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
                html += '<span style="font-size:11px;color:var(--gray);">' + this._paginaHistorias + '/' + totalPaginasHistorias + '</span>';
                html += '<button class="btn-secondary" onclick="window.UITonos._irPaginaHistorias(' + (this._paginaHistorias + 1) + ')" style="padding:2px 10px;font-size:10px;' + (this._paginaHistorias >= totalPaginasHistorias ? 'opacity:0.5;cursor:default;' : '') + '" ' + (this._paginaHistorias >= totalPaginasHistorias ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
            }
            html += '</div></div>';
            html += '<div style="display:flex;flex-direction:column;gap:10px;">';
            
            for (var hpi = 0; hpi < historiasPagina.length; hpi++) {
                var historia = historiasPagina[hpi];
                var globalIdx = inicioHistorias + hpi;
                var key = 'historia_' + caracter + '_' + globalIdx;
                var esGuardada = this._historiasGuardadas[key] === true;
                var esLeida = this._historiasLeidas.has(key);
                var tonoColor = this._getColorTono(historia.tono);
                var completada = historia.completada || false;
                
                var tituloColor = completada ? 'var(--success)' : tonoColor;
                var tituloIcon = completada ? '✅' : '📖';
                var tituloMostrar = historia.titulo || 'Historia de tonos - ' + caracter;
                
                html += '<div style="background:' + (esLeida ? 'var(--success)04' : 'var(--bg)') + ';border-radius:10px;padding:12px 16px;border:2px solid ' + (completada ? 'var(--success)' : (esLeida ? 'var(--success)' : 'var(--light)')) + ';display:flex;flex-direction:column;gap:6px;cursor:pointer;" onclick="window.UITonos._estudiarHistoriaCompleta(\'' + caracter + '\',' + globalIdx + ')" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'' + (completada ? 'var(--success)' : (esLeida ? 'var(--success)' : 'var(--light)')) + '\'">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">';
                html += '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:18px;font-weight:700;color:' + tituloColor + ';">' + tituloIcon + ' ' + tituloMostrar + '</span>';
                if (historia.tono) html += '<span style="font-size:11px;color:' + tonoColor + ';font-weight:600;background:' + tonoColor + '10;padding:2px 12px;border-radius:12px;">🎵 ' + historia.tono + '</span>';
                if (completada) html += '<span style="font-size:10px;color:var(--success);font-weight:600;">✅ Completada</span>';
                if (esLeida) html += '<span style="font-size:10px;color:var(--info);font-weight:600;">📖 Leída</span>';
                if (esGuardada) html += '<span style="font-size:10px;color:var(--success);font-weight:600;">⭐ Guardada</span>';
                html += '</div><span style="font-size:11px;color:var(--gray-light);">' + (historia.frases?.length || 0) + ' frases</span></div>';
                html += '<div style="font-size:12px;color:var(--gray-light);padding-left:10px;border-left:2px solid ' + tituloColor + ';">' + (historia.resumen || 'Sin resumen disponible') + '</div>';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;border-top:1px solid var(--light);padding-top:6px;margin-top:2px;">';
                html += '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">';
                html += '<label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:' + (completada ? 'var(--success)15' : 'var(--bg)') + ';border-radius:10px;border:1px solid ' + (completada ? 'var(--success)' : 'var(--light)') + ';" onclick="event.stopPropagation();"><input type="checkbox" ' + (completada ? 'checked' : '') + ' onchange="window.UITonos._toggleHistoriaCompletada(\'' + caracter + '\',' + globalIdx + ', this.checked)" style="margin:0;width:12px;height:12px;cursor:pointer;"><span style="color:' + (completada ? 'var(--success)' : 'var(--gray)') + ';font-size:8px;">' + (completada ? '✅' : '⬜') + '</span><span style="font-size:7px;color:var(--gray-light);">Completada</span></label>';
                html += '<label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:' + (esLeida ? 'var(--success)15' : 'var(--bg)') + ';border-radius:10px;border:1px solid ' + (esLeida ? 'var(--success)' : 'var(--light)') + ';" onclick="event.stopPropagation();"><input type="checkbox" ' + (esLeida ? 'checked' : '') + ' onchange="window.UITonos._toggleHistoriaLeida(\'' + caracter + '\',' + globalIdx + ', this.checked)" style="margin:0;width:12px;height:12px;cursor:pointer;"><span style="color:' + (esLeida ? 'var(--success)' : 'var(--gray)') + ';font-size:8px;">' + (esLeida ? '✅' : '⬜') + '</span><span style="font-size:7px;color:var(--gray-light);">Leída</span></label>';
                html += '</div>';
                html += '<div style="display:flex;gap:4px;">';
                if (!esGuardada) {
                    html += '<button onclick="event.stopPropagation();window.UITonos._guardarHistoria(\'' + caracter + '\',' + globalIdx + ')" style="padding:2px 12px;font-size:10px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-save"></i> Guardar</button>';
                }
                html += '<button onclick="event.stopPropagation();window.UITonos._leerHistoriaCompleta(\'' + caracter + '\',' + globalIdx + ')" style="padding:2px 12px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-book"></i> Leer</button>';
                html += '<button onclick="event.stopPropagation();window.UITonos._estudiarHistoriaCompleta(\'' + caracter + '\',' + globalIdx + ')" style="padding:2px 12px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar</button>';
                html += '<button onclick="event.stopPropagation();window.UITonos._eliminarHistoria(\'' + caracter + '\',' + globalIdx + ')" style="padding:2px 12px;font-size:10px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;" title="Eliminar esta historia"><i class="fas fa-trash"></i></button>';
                html += '</div></div></div>';
            }
            
            html += '</div></div>';
        } else {
            html += '<div style="text-align:center;padding:30px;color:var(--gray-light);background:var(--bg);border-radius:8px;border:2px dashed var(--light);">';
            html += '<div style="font-size:48px;margin-bottom:12px;">📖</div>';
            html += '<p style="font-size:15px;font-weight:500;">No hay historias generadas para este carácter.</p>';
            html += '<p style="font-size:13px;">Usa el botón <strong>"Generar Historia"</strong> para crear una historia de 8-10 líneas que use todos los tonos.</p>';
            html += '</div>';
        }
        
        html += '</div>';

        return html;
    }

    // ============================================================
    // MÉTODOS DE FILTRO, NAVEGACIÓN Y ACCIONES
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

    _irPaginaHistorias(pagina) {
        var caracter = this._caracterActual;
        var historias = this._historiasPorCaracter[caracter] || [];
        var totalHistorias = historias.length;
        var totalPaginas = Math.max(1, Math.ceil(totalHistorias / this._historiasPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaHistorias = pagina;
        this._renderizarPanel();
    }

    _toggleOcultarTraduccion() {
        this._ocultarTraduccion = !this._ocultarTraduccion;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        if (this._core) {
            this._core.mostrarToast(
                this._ocultarTraduccion ? '🔒 Traducción oculta' : '👁️ Traducción visible',
                'info'
            );
        }
    }

    _toggleVisorTraduccion(checked) {
        this._visorOcultarTraduccion = checked;
        this._guardarEstadoCompleto();
        this._renderizarVisorHistoriaTonal();
        if (this._core) {
            this._core.mostrarToast(
                checked ? '🔒 Traducción oculta - Intenta leer y comprender por ti mismo' : '👁️ Traducción visible',
                'info'
            );
        }
    }

    _toggleHistoriaLeida(caracter, idx, checked) {
        var key = 'historia_' + caracter + '_' + idx;
        if (checked) {
            this._historiasLeidas.add(key);
        } else {
            this._historiasLeidas.delete(key);
        }
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        if (this._core) {
            this._core.mostrarToast(
                checked ? '✅ Historia marcada como leída' : '↩️ Historia desmarcada como leída',
                checked ? 'success' : 'info'
            );
        }
    }

    async _toggleHistoriaCompletada(caracter, idx, checked) {
        var historias = this._historiasPorCaracter[caracter] || [];
        var historia = historias[idx];
        if (!historia) return;

        if (checked) {
            historia.completada = true;
            if (this._core) this._core.mostrarToast('✅ Historia marcada como completada', 'success');
            
            if (historia.id) {
                var frases = await db.obtenerFrasesPorHistoria(historia.id);
                for (var fi = 0; fi < frases.length; fi++) {
                    var f = frases[fi];
                    try {
                        var progreso = await db.obtenerProgreso(f.id);
                        if (progreso) {
                            progreso.rcn = 5.0;
                            progreso.estado = 'completada';
                            progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 5;
                            await db.guardarProgreso(progreso);
                        } else {
                            var nuevoProgreso = {
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
                
                var historiaDB = await db.get('historias', historia.id);
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
                var frases2 = await db.obtenerFrasesPorHistoria(historia.id);
                for (var fi2 = 0; fi2 < frases2.length; fi2++) {
                    var f2 = frases2[fi2];
                    try {
                        var progreso2 = await db.obtenerProgreso(f2.id);
                        if (progreso2) {
                            progreso2.rcn = 0;
                            progreso2.estado = 'en_curso';
                            progreso2.repasosExitosos = 0;
                            progreso2.repasosFallidos = 0;
                            await db.guardarProgreso(progreso2);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error resetando RCN:', e);
                    }
                }
                
                var historiaDB2 = await db.get('historias', historia.id);
                if (historiaDB2) {
                    historiaDB2.estado = 'en_curso';
                    historiaDB2._completada = false;
                    historiaDB2._rcnPromedio = 0;
                    delete historiaDB2._fechaCompletado;
                    await db.update('historias', historiaDB2);
                }
            }
            if (this._core) this._core.mostrarToast('🔄 RCN reseteado. Puedes volver a estudiar la historia.', 'info');
        }
        
        this._guardarEstadoCompleto();
        this._renderizarPanel();
    }

    async _eliminarHistoria(caracter, idx) {
        var historias = this._historiasPorCaracter[caracter] || [];
        var historia = historias[idx];
        if (!historia) {
            if (this._core) this._core.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        var confirmar = await this._core?.confirm(
            '⚠️ ¿Eliminar la historia "' + (historia.titulo || 'Sin título') + '"?\n\nSe eliminarán todas las frases asociadas.\n\nEsta acción NO se puede deshacer.\n\n¿Continuar?',
            '🗑️ Eliminar Historia'
        );

        if (!confirmar) return;

        try {
            if (historia.id) {
                var frases = await db.obtenerFrasesPorHistoria(historia.id);
                for (var fi = 0; fi < frases.length; fi++) {
                    await db.delete('frases', frases[fi].id);
                }
                await db.delete('historias', historia.id);
                console.log('🗑️ Historia "' + historia.titulo + '" eliminada de la DB');
            }

            // CORRECCIÓN: Eliminar la historia del array específico
            historias.splice(idx, 1);
            this._historiasPorCaracter[caracter] = historias;
            
            // Reindexar las keys de leídas y guardadas
            var nuevasGuardadas = {};
            var nuevasLeidas = new Set();
            for (var i = 0; i < historias.length; i++) {
                var oldKey = 'historia_' + caracter + '_' + (i >= idx ? i + 1 : i);
                var newKey = 'historia_' + caracter + '_' + i;
                if (this._historiasGuardadas[oldKey]) {
                    nuevasGuardadas[newKey] = true;
                }
                if (this._historiasLeidas.has(oldKey)) {
                    nuevasLeidas.add(newKey);
                }
            }
            for (var key in this._historiasGuardadas) {
                if (key.startsWith('historia_' + caracter + '_')) {
                    if (!nuevasGuardadas[key]) {
                        delete this._historiasGuardadas[key];
                    }
                }
            }
            for (var key2 in nuevasGuardadas) {
                this._historiasGuardadas[key2] = true;
            }
            for (var key3 of nuevasLeidas) {
                this._historiasLeidas.add(key3);
            }

            this._guardarEstadoCompleto();
            this._renderizarPanel();
            if (this._core) this._core.mostrarToast('🗑️ Historia "' + (historia.titulo || 'Sin título') + '" eliminada', 'warning');
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }

        } catch (error) {
            console.error('❌ Error eliminando historia:', error);
            if (this._core) this._core.mostrarToast('❌ Error al eliminar la historia', 'error');
        }
    }

    _seleccionarCaracter() {
        var caracteresRaiz = this._caracteresRaizCache || this._generarCaracteresEjemplo();
        
        if (!caracteresRaiz || caracteresRaiz.length === 0) {
            if (this._core) this._core.mostrarToast('❌ No hay caracteres raíz disponibles. Usando ejemplos.', 'warning');
            this._usarCaracteresEjemplo();
            return;
        }

        var opciones = '';
        for (var i = 0; i < caracteresRaiz.length; i++) {
            var c = caracteresRaiz[i];
            var palabra = c.palabra || c.hanzi || '?';
            var pinyin = c.pinyin || '';
            var significado = c.significado || palabra;
            opciones += (i + 1) + '. ' + palabra + (pinyin ? ' (' + pinyin + ')' : '') + ' - ' + significado + '\n';
        }

        var seleccion = this._core?.prompt(
            '🀄 Selecciona un carácter raíz para estudiar sus tonos:\n\n' + opciones,
            '1',
            'Número del carácter...',
            '🎵 Seleccionar Carácter'
        );

        if (seleccion) {
            var idx = parseInt(seleccion) - 1;
            if (!isNaN(idx) && idx >= 0 && idx < caracteresRaiz.length) {
                var c2 = caracteresRaiz[idx];
                this._seleccionarCaracterEspecifico(
                    c2.palabra || c2.hanzi || '?', 
                    c2.pinyin || '', 
                    c2.significado || ''
                );
            }
        }
    }

    _seleccionarCaracterEspecifico(caracter, pinyin, significado) {
        console.log('🎵 Seleccionando carácter: ' + caracter + ' (' + pinyin + ')');
        
        this._caracterActual = caracter;
        this._paginaHistorias = 1;
        this._tonosData = this._obtenerDatosTonos(caracter, pinyin, significado);
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        if (this._core) {
            this._core.mostrarToast('🎵 Carácter "' + caracter + '" seleccionado (' + (this._historiasPorCaracter[caracter]?.length || 0) + ' historias)', 'success');
        }
    }

    _cambiarCaracter() {
        this._guardarEstadoCompleto();
        this._caracterActual = null;
        this._tonosData = null;
        this._paginaHistorias = 1;
        this._renderizarPanel();
    }

    _usarCaracteresEjemplo() {
        var ejemplos = this._generarCaracteresEjemplo();
        if (ejemplos.length > 0) {
            var c = ejemplos[0];
            this._seleccionarCaracterEspecifico(c.palabra, c.pinyin || '', c.significado || '');
            if (this._core) this._core.mostrarToast('🎵 Usando caracteres de ejemplo: "' + c.palabra + '"', 'info');
        }
    }

    _generarHistoriaTonos() {
        if (this._generando) {
            if (this._core) this._core.mostrarToast('⏳ Ya hay una generación en curso', 'warning');
            return;
        }

        if (!this._caracterActual || !this._tonosData) {
            if (this._core) this._core.mostrarToast('❌ Selecciona un carácter primero', 'error');
            return;
        }

        this._generando = true;
        if (this._core) this._core.mostrarToast('📖 Generando historia para "' + this._caracterActual + '"...', 'info');

        try {
            var idioma = this._obtenerIdiomaActual() || 'zh';
            var idiomaNativo = this._obtenerIdiomaNativo();
            var nivel = this._obtenerNivelRealUsuario();
            var significadoBase = this._tonosData.significado || this._caracterActual;

            var tonosList = Object.keys(this._tonosData.tonos || {});
            
            var tituloSugerido = 'Historia con "' + this._caracterActual + '" (' + significadoBase + ')';
            
            var template = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "7.8",
                    "accion": 'Genera una historia de 8-10 líneas en ' + idioma + ' que use el carácter "' + this._caracterActual + '" en TODOS sus tonos',
                    "caracter_principal": this._caracterActual,
                    "significado_base": significadoBase,
                    "tonos_disponibles": tonosList,
                    "idioma_objetivo": idioma,
                    "idioma_nativo": idiomaNativo,
                    "nivel": nivel,
                    "num_lineas": "8-10",
                    "instrucciones": [
                        '1. Escribe una historia de 8 a 10 líneas en ' + idioma + '.',
                        '2. Cada línea debe ser una frase corta y natural.',
                        '3. La historia DEBE incluir el carácter "' + this._caracterActual + '" en TODOS los tonos disponibles.',
                        '4. Cada línea debe incluir el pinyin COMPLETO de la frase.',
                        '5. Cada línea debe tener su traducción al ' + idiomaNativo + '.',
                        '6. Las frases deben formar una historia coherente.',
                        '7. Marca qué tono se usa en cada línea.',
                        '8. IMPORTANTE: NO uses placeholders como [frase] o [pinyin].',
                        '9. Responde SOLO en formato JSON válido.',
                        '10. El título de la historia debe ser NATURAL y DESCRIPTIVO, relacionado con el contenido.',
                        '11. Para CADA línea, incluye un array \'palabras\' con TODAS las palabras de la frase.',
                        '12. Cada palabra debe tener: \'hanzi\', \'pinyin\', \'significado\', \'familia_semantica\', \'tipo_gramatical\'.'
                    ],
                    "formato": {
                        "lineas": [
                            {
                                "numero": 1,
                                "hanzi": "Frase en ${idioma}",
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
                    "version": "7.8",
                    "titulo_historia": tituloSugerido
                },
                "lineas": tonosList.map(function(tono, idx) {
                    return {
                        "numero": idx + 1,
                        "hanzi": '[Frase ' + (idx+1) + ' con el carácter "' + this._caracterActual + '" en tono ' + tono + ']',
                        "pinyin": '[pinyin_con_tonos_de_la_frase_' + (idx+1) + ']',
                        "traduccion": '[Traducción al ' + idiomaNativo + ' de la frase ' + (idx+1) + ']',
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
                    };
                }.bind(this))
            };

            while (template.lineas.length < 8) {
                var idx2 = template.lineas.length;
                var tono2 = tonosList[idx2 % tonosList.length];
                template.lineas.push({
                    "numero": idx2 + 1,
                    "hanzi": '[Frase ' + (idx2+1) + ' con el carácter "' + this._caracterActual + '" en tono ' + tono2 + ']',
                    "pinyin": '[pinyin_con_tonos_de_la_frase_' + (idx2+1) + ']',
                    "traduccion": '[Traducción al ' + idiomaNativo + ' de la frase ' + (idx2+1) + ']',
                    "tono_usado": tono2,
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
            this._guardarEstadoCompleto();
            if (this._core) this._core.mostrarToast('📄 Plantilla JSON generada. Copia, completa con IA externa e importa.', 'success');

        } catch (error) {
            console.error('❌ Error generando historia:', error);
            if (this._core) this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }

        this._generando = false;
    }

    _mostrarModalHistoriaJSON(template) {
        if (!this._core) return;

        this._core.abrirModal('📖 Generar Historia de Tonos');

        var textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = JSON.stringify(template, null, 2);
            textarea.readOnly = false;
            textarea.style.minHeight = '500px';
            textarea.style.fontSize = '12px';
            textarea.style.fontFamily = 'monospace';
        }

        var infoDiv = document.createElement('div');
        infoDiv.id = 'historiaInfoDiv';
        infoDiv.style.cssText = 'background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius: 8px;padding: 12px 16px;margin-bottom: 12px;font-size: 12px;color: var(--gray);border-left: 4px solid var(--primary);';
        infoDiv.innerHTML = '<strong>📋 Instrucciones:</strong><br>1. Copia este JSON y envíalo a Groq/ChatGPT con las instrucciones que contiene.<br>2. La IA completará el JSON con una historia de 8-10 líneas.<br>3. <strong>IMPORTANTE:</strong> Cada línea debe usar el carácter en un tono diferente.<br>4. <strong>🔥 IMPORTANTE:</strong> El título de la historia debe ser NATURAL y DESCRIPTIVO.<br>5. <strong>🔥 IMPORTANTE:</strong> Cada línea debe incluir palabras desglosadas con pinyin, significado y tipo.<br>6. Cuando la IA te devuelva el JSON completado, pégalo aquí y pulsa <strong>"Importar"</strong>.<br>7. La historia se guardará como una unidad completa con todas sus frases y palabras.<br><br><span style="font-size:11px;color:var(--gray-light);">🎯 Carácter: <strong>' + this._caracterActual + '</strong> · Tonos: ' + Object.keys(this._tonosData.tonos || {}).join(', ') + '</span><br><span style="font-size:10px;color:var(--success);">🔥 SIN CONSUMO DE TOKENS - Solo generas la plantilla, la IA externa la completa.</span><br><span style="font-size:10px;color:var(--primary);">📖 Ejemplo de título natural: "Mi familia feliz" en lugar de "Historia de tonos - 家"</span><br><span style="font-size:10px;color:var(--secondary);">📝 Las palabras desglosadas permiten ver el significado de cada palabra al leer la historia.</span>';

        var modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            var oldInfo = modalBody.querySelector('#historiaInfoDiv');
            if (oldInfo) oldInfo.remove();
            modalBody.insertBefore(infoDiv, modalBody.firstChild);
        }

        var importBtn = document.getElementById('jsonImport');
        if (importBtn) {
            var newImportBtn = importBtn.cloneNode(true);
            importBtn.parentNode.replaceChild(newImportBtn, importBtn);
            
            var self = this;
            newImportBtn.onclick = async function() {
                var jsonText = document.getElementById('jsonTextarea').value;
                if (jsonText) {
                    try {
                        var data = JSON.parse(jsonText);
                        
                        var primeraLinea = data.lineas?.[0]?.hanzi || '';
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

        var copyBtn = document.getElementById('jsonCopy');
        if (copyBtn) {
            var newCopyBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
            newCopyBtn.onclick = function() {
                var textarea = document.getElementById('jsonTextarea');
                if (textarea) {
                    navigator.clipboard.writeText(textarea.value)
                        .then(function() { self._core?.mostrarToast('📋 JSON copiado al portapapeles', 'success'); })
                        ['catch'](function() {
                            textarea.select();
                            document.execCommand('copy');
                            self._core?.mostrarToast('📋 JSON copiado al portapapeles', 'success');
                        });
                }
            };
        }
    }

    async _importarHistoriaJSON(data) {
        if (this._importando) {
            if (this._core) this._core.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }

        if (!data || !data.lineas || !Array.isArray(data.lineas) || data.lineas.length === 0) {
            throw new Error('JSON inválido: debe contener "lineas"');
        }

        this._importando = true;

        try {
            var idioma = data.meta?.idioma || this._obtenerIdiomaActual() || 'zh';
            var nivel = data.meta?.nivel || this._obtenerNivelRealUsuario();
            var caracterBase = data.meta?.caracter || this._caracterActual || 'Carácter base';
            
            var tituloHistoria = data.meta?.titulo_historia || 'Historia con "' + caracterBase + '"';
            
            if (tituloHistoria.includes('Historia de tonos') || tituloHistoria.includes('Historia con')) {
                var primerasLineas = '';
                for (var li = 0; li < Math.min(3, data.lineas.length); li++) {
                    primerasLineas += (data.lineas[li].hanzi || '') + ' ';
                }
                var palabrasClave = ['家', '我', '你', '他', '她', '们', '人', '朋友', '家人', '老师', '学生', '工作', '生活', '学习', '吃饭', '睡觉', '走路', '跑步', '看书', '写字', '说话', '唱歌', '跳舞', '旅行', '购物', '做饭', '打扫', '休息'];
                var temaEncontrado = null;
                for (var pci = 0; pci < palabrasClave.length; pci++) {
                    var palabra = palabrasClave[pci];
                    if (primerasLineas.includes(palabra)) {
                        var significado = this._DICCIONARIO[palabra] || palabra;
                        temaEncontrado = palabra + ' (' + significado + ')';
                        break;
                    }
                }
                if (temaEncontrado) {
                    tituloHistoria = 'Historia sobre ' + temaEncontrado;
                } else {
                    var significadoBase2 = this._tonosData?.significado || caracterBase;
                    tituloHistoria = 'Práctica de tonos: "' + caracterBase + '" (' + significadoBase2 + ')';
                }
            }

            var tonoPrincipal = data.lineas[0]?.tono_usado || 'Desconocido';

            var historiaObj = {
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
                _tonosUsados: data.lineas.map(function(l) { return l.tono_usado; }).filter(function(t) { return t; })
            };

            var historiaId = await db.guardarHistoria(historiaObj);

            if (!historiaId) {
                throw new Error('No se pudo guardar la historia');
            }

            var frasesGuardadas = [];
            var importadas = 0;
            var duplicadas = 0;
            var errores = 0;

            var frasesExistentes = await db.obtenerFrasesPorIdioma(idioma);

            for (var li2 = 0; li2 < data.lineas.length; li2++) {
                var linea = data.lineas[li2];
                if (!linea.hanzi || !linea.pinyin || !linea.traduccion) {
                    errores++;
                    continue;
                }

                var existe = false;
                for (var ei = 0; ei < frasesExistentes.length; ei++) {
                    if (frasesExistentes[ei].original === linea.hanzi && frasesExistentes[ei].idioma === idioma) {
                        existe = true;
                        break;
                    }
                }

                if (existe) {
                    duplicadas++;
                    continue;
                }

                try {
                    var palabrasIds = [];
                    
                    if (linea.palabras && Array.isArray(linea.palabras) && linea.palabras.length > 0) {
                        for (var pi = 0; pi < linea.palabras.length; pi++) {
                            var p = linea.palabras[pi];
                            if (!p.hanzi) continue;
                            try {
                                var existentes = await db.obtenerPalabrasPorIdioma(idioma);
                                var existente = null;
                                for (var ei2 = 0; ei2 < existentes.length; ei2++) {
                                    if ((existentes[ei2].palabra || existentes[ei2].hanzi || '') === p.hanzi) {
                                        existente = existentes[ei2];
                                        break;
                                    }
                                }
                                var idPalabra;
                                if (existente) {
                                    idPalabra = existente.id;
                                    existente.frecuencia = (existente.frecuencia || 0) + 1;
                                    if (p.pinyin) existente.pinyin = p.pinyin;
                                    if (p.significado) existente.significado = p.significado;
                                    await db.guardarPalabra(existente);
                                } else {
                                    var nuevaPalabra = {
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
                                console.warn('⚠️ Error guardando palabra "' + p.hanzi + '":', e);
                            }
                        }
                    } else {
                        var palabrasExtraidas = this._extraerPalabrasDeFrase(linea.hanzi, linea.pinyin, idioma, nivel, caracterBase);
                        for (var pe = 0; pe < palabrasExtraidas.length; pe++) {
                            var p2 = palabrasExtraidas[pe];
                            try {
                                var existentes2 = await db.obtenerPalabrasPorIdioma(idioma);
                                var existente2 = null;
                                for (var ei3 = 0; ei3 < existentes2.length; ei3++) {
                                    if ((existentes2[ei3].palabra || existentes2[ei3].hanzi || '') === p2.hanzi) {
                                        existente2 = existentes2[ei3];
                                        break;
                                    }
                                }
                                var idPalabra2;
                                if (existente2) {
                                    idPalabra2 = existente2.id;
                                    existente2.frecuencia = (existente2.frecuencia || 0) + 1;
                                    await db.guardarPalabra(existente2);
                                } else {
                                    var nuevaPalabra2 = {
                                        palabra: p2.hanzi,
                                        hanzi: p2.hanzi,
                                        pinyin: p2.pinyin || '',
                                        significado: p2.significado || p2.hanzi,
                                        familia: p2.familia || 'sustantivo',
                                        familias: [p2.familia || 'sustantivo'],
                                        familiaSemantica: p2.familiaSemantica || 'General',
                                        nivel: nivel,
                                        tipo: p2.tipo || 'sustantivo',
                                        idioma: idioma,
                                        frecuencia: 1,
                                        neuroScore: 0.5,
                                        nivelDominio: 'nuevo',
                                        fechaCreacion: Date.now(),
                                        _esTono: true,
                                        _caracterBase: caracterBase
                                    };
                                    idPalabra2 = await db.guardarPalabra(nuevaPalabra2);
                                }
                                if (idPalabra2) {
                                    palabrasIds.push({
                                        id: idPalabra2,
                                        palabra: p2.hanzi,
                                        hanzi: p2.hanzi,
                                        pinyin: p2.pinyin || '',
                                        significado: p2.significado || p2.hanzi,
                                        familia: p2.familia || 'sustantivo'
                                    });
                                }
                            } catch (e) {
                                console.warn('⚠️ Error guardando palabra "' + p2.hanzi + '":', e);
                            }
                        }
                    }

                    var fraseObj = {
                        original: linea.hanzi.trim(),
                        traduccion: linea.traduccion.trim(),
                        historiaId: historiaId,
                        idioma: idioma,
                        nivel: nivel,
                        esJeroglifico: true,
                        pinyinCompleto: linea.pinyin.trim(),
                        reglaGramatical: 'Tono: ' + (linea.tono_usado || 'Desconocido'),
                        tipoRegla: 'tono',
                        familiaSemantica: 'Historia de tonos - ' + caracterBase,
                        palabras: palabrasIds,
                        activa: true,
                        rg: 0,
                        rcn: 0,
                        _esTono: true,
                        _tono: linea.tono_usado || 'Desconocido',
                        _caracterBase: linea.caracter_usado || caracterBase,
                        _historiaId: historiaId
                    };

                    var id = await db.guardarFrase(fraseObj);

                    if (id) {
                        importadas++;
                        frasesGuardadas.push(id);
                    } else {
                        errores++;
                    }

                } catch (e) {
                    console.warn('⚠️ Error importando línea "' + linea.hanzi + '":', e);
                    errores++;
                }
            }

            await db.update('historias', {
                ...historiaObj,
                id: historiaId,
                frases: frasesGuardadas.length
            });

            var resumenLineas = '';
            for (var rl = 0; rl < Math.min(3, data.lineas.length); rl++) {
                resumenLineas += (data.lineas[rl].hanzi || '') + ' ... ';
            }
            
            var nuevaHistoria = {
                id: historiaId,
                titulo: tituloHistoria,
                tono: tonoPrincipal,
                frases: data.lineas.map(function(l, idx) {
                    return {
                        ...l,
                        id: frasesGuardadas[idx] || null
                    };
                }),
                resumen: resumenLineas || 'Sin resumen disponible',
                completada: false
            };
            
            // CORRECCIÓN: Guardar en el array del caracter correspondiente
            if (!this._historiasPorCaracter[caracterBase]) {
                this._historiasPorCaracter[caracterBase] = [];
            }
            var idx2 = this._historiasPorCaracter[caracterBase].length;
            this._historiasPorCaracter[caracterBase].push(nuevaHistoria);
            
            // La historia NO se marca como leída al importar
            // El checkbox "Leída" aparece desmarcado

            this._guardarEstadoCompleto();

            var mensaje = '✅ Historia importada correctamente\n\n' +
                '📝 Líneas importadas: ' + importadas + '\n' +
                '⏭️ Duplicadas omitidas: ' + duplicadas + '\n' +
                '❌ Errores: ' + errores + '\n\n' +
                '📖 Título: "' + tituloHistoria + '"\n' +
                '📝 Palabras desglosadas: ' + (frasesGuardadas.length > 0 ? '✅ Incluidas' : '⚠️ No disponibles') + '\n\n' +
                '📌 La historia NO está marcada como leída. Marca el checkbox "Leída" cuando la hayas leído.\n' +
                '💡 La historia está disponible para estudiar y leer.';

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

    _extraerPalabrasDeFrase(hanzi, pinyin, idioma, nivel, caracterBase) {
        var palabras = [];
        if (!hanzi) return palabras;
        
        var segmentacion = this._segmentarPorDiccionario(hanzi);
        var segmentos = segmentacion.segmentos;
        var pinyinPalabras = pinyin ? pinyin.split(/\s+/) : [];
        
        var pIdx = 0;
        for (var i = 0; i < segmentos.length; i++) {
            var seg = segmentos[i];
            var py = pIdx < pinyinPalabras.length ? pinyinPalabras[pIdx] : '';
            pIdx++;
            
            var tipo = 'sustantivo';
            var familiaSemantica = 'General';
            var significado = seg;
            
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
            
            var familiaMap = {
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
                
                for (var clave in familiaMap) {
                    if (familiaMap.hasOwnProperty(clave) && seg.includes(clave) && seg.length <= 3) {
                        familiaSemantica = familiaMap[clave];
                        break;
                    }
                }
            }
            
            var pinyinFinal = py;
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

    async _guardarHistoria(caracter, idx) {
        var historias = this._historiasPorCaracter[caracter] || [];
        var historia = historias[idx];
        if (!historia) {
            if (this._core) this._core.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        var key = 'historia_' + caracter + '_' + idx;
        if (this._historiasGuardadas[key]) {
            if (this._core) this._core.mostrarToast('ℹ️ Esta historia ya está guardada', 'info');
            return;
        }

        if (this._core) this._core.mostrarToast('💾 Guardando historia...', 'info');

        try {
            var idioma = this._obtenerIdiomaActual() || 'zh';
            var nivel = this._obtenerNivelRealUsuario();
            var caracterBase = caracter;
            var tituloHistoria = historia.titulo || 'Historia de tonos - ' + caracterBase;

            var historiaObj = {
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

            var historiaId = await db.guardarHistoria(historiaObj);

            if (historiaId) {
                var frasesGuardadas = 0;
                if (historia.frases) {
                    for (var fi = 0; fi < historia.frases.length; fi++) {
                        var f = historia.frases[fi];
                        if (!f.hanzi && !f.original) continue;
                        
                        var fraseObj = {
                            original: f.hanzi || f.original || '',
                            traduccion: f.traduccion || '',
                            historiaId: historiaId,
                            idioma: idioma,
                            nivel: nivel,
                            esJeroglifico: true,
                            pinyinCompleto: f.pinyin || '',
                            reglaGramatical: 'Tono: ' + (f.tono || 'Desconocido'),
                            tipoRegla: 'tono',
                            familiaSemantica: 'Historia de tonos - ' + caracterBase,
                            palabras: [],
                            activa: true,
                            rg: 0,
                            rcn: 0,
                            _esTono: true,
                            _tono: f.tono || 'Desconocido',
                            _caracterBase: caracterBase,
                            _historiaId: historiaId
                        };
                        
                        var id = await db.guardarFrase(fraseObj);
                        if (id) frasesGuardadas++;
                    }
                }

                await db.update('historias', {
                    ...historiaObj,
                    id: historiaId,
                    frases: frasesGuardadas
                });

                this._historiasGuardadas[key] = true;
                if (this._core) {
                    this._core.mostrarToast('✅ Historia "' + tituloHistoria + '" guardada en Mi Espacio (' + frasesGuardadas + ' frases)', 'success');
                }
                
                if (window.gestorFavoritos) {
                    await window.gestorFavoritos.añadirHistoria(historiaId);
                    await window.gestorFavoritos.añadirHistoriaAGrupo(historiaId, '🎵 Tonos - ' + caracterBase);
                    await window.gestorFavoritos.añadirHistoriaAGrupo(historiaId, '📚 Nivel ' + nivel);
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
            if (this._core) this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _guardarTodasHistorias() {
        var caracter = this._caracterActual;
        if (!caracter) {
            if (this._core) this._core.mostrarToast('❌ Selecciona un carácter primero', 'error');
            return;
        }
        
        var historias = this._historiasPorCaracter[caracter] || [];
        var guardadas = 0;
        var yaGuardadas = 0;
        var errores = 0;

        for (var i = 0; i < historias.length; i++) {
            var key = 'historia_' + caracter + '_' + i;
            if (this._historiasGuardadas[key]) {
                yaGuardadas++;
                continue;
            }
            try {
                await this._guardarHistoria(caracter, i);
                guardadas++;
            } catch (e) {
                errores++;
            }
        }

        if (this._core) {
            this._core.mostrarToast(
                '✅ ' + guardadas + ' historias guardadas' + (yaGuardadas > 0 ? ', ' + yaGuardadas + ' ya existentes' : '') + (errores > 0 ? ', ' + errores + ' errores' : ''),
                'success'
            );
        }
        this._guardarEstadoCompleto();
    }

    _limpiarHistorias() {
        var total = 0;
        for (var key in this._historiasPorCaracter) {
            total += this._historiasPorCaracter[key].length;
        }
        var confirmar = this._core?.confirm(
            '🧹 ¿Limpiar TODAS las historias generadas?\n\nSe eliminarán ' + total + ' historias.\n\n⚠️ Esta acción NO se puede deshacer.\n\n¿Continuar?',
            '🧹 Limpiar Todas las Historias'
        );
        
        if (!confirmar) return;
        
        for (var key in this._historiasPorCaracter) {
            var historias = this._historiasPorCaracter[key];
            for (var i = 0; i < historias.length; i++) {
                var historia = historias[i];
                if (historia.id) {
                    try {
                        db.obtenerFrasesPorHistoria(historia.id).then(function(frases) {
                            for (var fi = 0; fi < frases.length; fi++) {
                                db.delete('frases', frases[fi].id);
                            }
                            db.delete('historias', historia.id);
                        });
                    } catch (e) {
                        console.warn('⚠️ Error eliminando historia "' + historia.titulo + '":', e);
                    }
                }
            }
        }
        
        this._historiasPorCaracter = {};
        this._historiasGuardadas = {};
        this._historiasLeidas = new Set();
        this._paginaHistorias = 1;
        this._guardarEstadoCompleto();
        this._renderizarPanel();
        if (this._core) this._core.mostrarToast('🧹 Todas las historias limpiadas correctamente', 'success');
        
        if (window.UIDashboard) {
            window.UIDashboard._cargarDashboardInicial(this._core);
        }
    }

    async _estudiarHistoriaCompleta(caracter, idx) {
        var historias = this._historiasPorCaracter[caracter] || [];
        var historia = historias[idx];
        if (!historia || !historia.frases || historia.frases.length === 0) {
            if (this._core) this._core.mostrarToast('❌ Esta historia no tiene frases para estudiar', 'error');
            return;
        }

        try {
            this._historiaActual = historia;
            this._estudiandoHistoriaCompleta = true;
            this._historiaEnEstudio = { caracter: caracter, idx: idx };
            
            var historiaId = historia.id;
            var key = 'historia_' + caracter + '_' + idx;
            if (!historiaId || !this._historiasGuardadas[key]) {
                var idioma = this._obtenerIdiomaActual() || 'zh';
                var nivel = this._obtenerNivelRealUsuario();
                var caracterBase = caracter;
                var tituloHistoria = historia.titulo || 'Historia de tonos - ' + caracterBase;
                
                var historiaObj = {
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
                    var frasesGuardadas = 0;
                    if (historia.frases) {
                        for (var fi = 0; fi < historia.frases.length; fi++) {
                            var f = historia.frases[fi];
                            if (!f.hanzi && !f.original) continue;
                            var fraseObj = {
                                original: f.hanzi || f.original || '',
                                traduccion: f.traduccion || '',
                                historiaId: historiaId,
                                idioma: idioma,
                                nivel: nivel,
                                esJeroglifico: true,
                                pinyinCompleto: f.pinyin || '',
                                reglaGramatical: 'Tono: ' + (f.tono || 'Desconocido'),
                                tipoRegla: 'tono',
                                familiaSemantica: 'Historia de tonos - ' + caracterBase,
                                palabras: [],
                                activa: true,
                                rg: 0,
                                rcn: 0,
                                _esTono: true,
                                _tono: f.tono || 'Desconocido',
                                _caracterBase: caracterBase,
                                _historiaId: historiaId
                            };
                            var id = await db.guardarFrase(fraseObj);
                            if (id) frasesGuardadas++;
                        }
                    }
                    await db.update('historias', {
                        ...historiaObj,
                        id: historiaId,
                        frases: frasesGuardadas
                    });
                    
                    this._historiasPorCaracter[caracter][idx].id = historiaId;
                    this._historiasGuardadas[key] = true;
                    this._guardarEstadoCompleto();
                }
            }
            
            var frasesDB = await db.obtenerFrasesPorHistoria(historiaId);
            
            var frasesParaEstudiar = [];
            for (var fi2 = 0; fi2 < frasesDB.length; fi2++) {
                var f2 = frasesDB[fi2];
                var historiaOriginal = this._historiasPorCaracter[caracter][idx];
                var tonoEncontrado = 'Desconocido';
                var caracterBase2 = caracter;
                
                if (historiaOriginal && historiaOriginal.frases) {
                    for (var hfi = 0; hfi < historiaOriginal.frases.length; hfi++) {
                        var hf = historiaOriginal.frases[hfi];
                        if (hf.hanzi === f2.original || hf.original === f2.original) {
                            tonoEncontrado = hf.tono || 'Desconocido';
                            caracterBase2 = hf.caracter_usado || caracter;
                            break;
                        }
                    }
                }
                
                var fraseObj2 = {
                    id: f2.id,
                    original: f2.original || '',
                    traduccion: f2.traduccion || '',
                    pinyinCompleto: f2.pinyinCompleto || '',
                    esJeroglifico: true,
                    idioma: this._obtenerIdiomaActual() || 'zh',
                    nivel: f2.nivel || this._obtenerNivelRealUsuario(),
                    palabras: f2.palabras || [],
                    reglaGramatical: 'Tono: ' + tonoEncontrado,
                    _esTono: true,
                    _tono: tonoEncontrado,
                    _caracterBase: caracterBase2,
                    _historiaIdx: idx,
                    _historiaTitulo: historia.titulo || 'Historia sin título',
                    _historiaId: historiaId,
                    _caracterKey: caracter,
                    progreso: null
                };
                
                try {
                    var progreso = await db.obtenerProgreso(f2.id);
                    if (progreso) {
                        fraseObj2.progreso = progreso;
                    }
                } catch (e) {}
                
                frasesParaEstudiar.push(fraseObj2);
            }
            
            if (frasesParaEstudiar.length === 0) {
                if (this._core) this._core.mostrarToast('❌ No se encontraron frases para estudiar', 'error');
                return;
            }
            
            if (window.pipeline) {
                pipeline.frases = frasesParaEstudiar;
                pipeline.indiceFrase = 0;
                await pipeline.cargarFrase(0);
                pipeline._estudiandoHistoria = true;
                pipeline._historiaIdActual = historiaId;
                pipeline._origenHistoria = 'tonos';
                pipeline._caracterKey = caracter;
                pipeline._historiaIdx = idx;
                
                if (this._core) {
                    this._core.irAModulo('study');
                    this._core.mostrarToast('📖 Estudiando: "' + historia.titulo + '" (' + frasesParaEstudiar.length + ' frases)', 'success');
                    
                    setTimeout(function() {
                        this._inyectarBotonVolverTonos();
                    }.bind(this), 300);
                }
            } else {
                if (this._core) this._core.mostrarToast('❌ Pipeline no disponible', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error estudiando historia:', error);
            if (this._core) this._core.mostrarToast('❌ Error al estudiar la historia', 'error');
        }
    }

    async _leerHistoriaCompleta(caracter, idx) {
        var historias = this._historiasPorCaracter[caracter] || [];
        var historia = historias[idx];
        if (!historia || !historia.frases || historia.frases.length === 0) {
            if (this._core) this._core.mostrarToast('❌ Esta historia no tiene frases para leer', 'error');
            return;
        }

        try {
            var historiaId = historia.id;
            if (!historiaId) {
                if (this._core) this._core.mostrarToast('❌ Esta historia no está guardada. Primero estúdiala o guárdala.', 'warning');
                return;
            }

            var historiaDB = await db.get('historias', historiaId);
            if (!historiaDB) {
                if (this._core) this._core.mostrarToast('❌ Historia no encontrada en la base de datos', 'error');
                return;
            }

            var frasesDB = await db.obtenerFrasesPorHistoria(historiaId);
            
            var frasesCompletas = [];
            for (var fi = 0; fi < frasesDB.length; fi++) {
                var f = frasesDB[fi];
                var palabrasCompletas = [];
                if (f.palabras && Array.isArray(f.palabras)) {
                    for (var pi = 0; pi < f.palabras.length; pi++) {
                        var p = f.palabras[pi];
                        if (p && typeof p === 'object' && p.id) {
                            try {
                                var palabraCompleta = await db.get('palabras', p.id);
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
                caracterKey: caracter,
                titulo: historiaDB.titulo || historia.titulo || 'Historia sin título',
                frases: frasesCompletas,
                tono: historiaDB._tono || historia.tono || 'Desconocido',
                caracterBase: historiaDB._caracterBase || caracter
            };
            
            this._visorAbierto = true;
            this._renderizarVisorHistoriaTonal();
            
        } catch (error) {
            console.error('❌ Error leyendo historia:', error);
            if (this._core) this._core.mostrarToast('❌ Error al leer la historia', 'error');
        }
    }

    _renderizarVisorHistoriaTonal() {
        var container = this._getContainer();
        if (!container) return;
        
        var historia = this._historiaVisor;
        if (!historia) return;
        
        var esJeroglifico = true;
        var titulo = historia.titulo || 'Historia sin título';
        var tonoColor = this._getColorTono(historia.tono);
        var caracterBase = historia.caracterBase || this._caracterActual || 'Carácter base';
        var nivel = this._obtenerNivelRealUsuario();
        var idioma = this._obtenerIdiomaActual() || 'zh';
        var ocultarTraduccion = this._visorOcultarTraduccion;
        
        var html = '<div style="padding:16px;max-width:900px;margin:0 auto;">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;padding:8px 16px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:12px;border:2px solid var(--primary)20;">';
        html += '<button class="btn-secondary" onclick="window.UITonos._cerrarVisorTonal()" style="padding:6px 14px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-arrow-left"></i> Volver</button>';
        html += '<span style="font-size:24px;">📖</span>';
        html += '<div style="flex:1;"><h2 style="font-size:20px;font-weight:800;color:var(--dark);margin:0;">' + titulo + '</h2>';
        html += '<p style="font-size:12px;color:var(--gray);margin:2px 0 0;">🎵 Tono: <span style="color:' + tonoColor + ';font-weight:600;">' + historia.tono + '</span> · 🀄 Carácter base: <strong>' + caracterBase + '</strong> · ' + historia.frases.length + ' frases</p></div>';
        html += '<div style="display:flex;gap:6px;align-items:center;">';
        html += '<label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:4px 12px;background:' + (ocultarTraduccion ? 'var(--warning)15' : 'var(--bg)') + ';border-radius:8px;border:1px solid ' + (ocultarTraduccion ? 'var(--warning)' : 'var(--light)') + ';">';
        html += '<input type="checkbox" ' + (ocultarTraduccion ? 'checked' : '') + ' onchange="window.UITonos._toggleVisorTraduccion(this.checked)" style="margin:0;width:14px;height:14px;cursor:pointer;">';
        html += '<span style="color:' + (ocultarTraduccion ? 'var(--warning)' : 'var(--gray)') + ';">' + (ocultarTraduccion ? '🔒 Traducción oculta' : '👁️ Mostrar traducción') + '</span></label>';
        html += '<button class="btn-primary" onclick="window.UITonos._estudiarHistoriaVisor()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar</button>';
        html += '<button class="btn-secondary" onclick="window.UITonos._cerrarVisorTonal()" style="padding:4px 14px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-times"></i> Cerrar</button>';
        html += '</div></div>';
        
        html += '<div style="display:flex;flex-direction:column;gap:12px;">';
        
        var numFrase = 0;
        for (var fi = 0; fi < historia.frases.length; fi++) {
            var frase = historia.frases[fi];
            numFrase++;
            var hanzi = frase.original || '';
            var pinyin = frase.pinyinCompleto || '';
            var traduccion = frase.traduccion || '';
            var tono = frase._tono || historia.tono || 'Desconocido';
            var tonoColorFrase = this._getColorTono(tono);
            var palabras = frase.palabras || [];
            
            html += '<div style="background:var(--white);border-radius:10px;padding:14px 18px;box-shadow:var(--shadow);border-left:4px solid ' + tonoColorFrase + ';">';
            html += '<div style="display:flex;gap:8px;align-items:start;">';
            html += '<span style="font-size:12px;font-weight:600;color:var(--gray-light);min-width:28px;">' + numFrase + '.</span>';
            html += '<div style="flex:1;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><span style="font-size:24px;font-weight:700;color:var(--dark);line-height:1.6;">' + hanzi + '</span><span style="font-size:11px;color:' + tonoColorFrase + ';font-weight:600;background:' + tonoColorFrase + '15;padding:2px 10px;border-radius:12px;">🎵 ' + tono + '</span></div>';
            if (pinyin) html += '<div style="font-size:16px;color:var(--primary);margin-top:2px;letter-spacing:1px;font-weight:500;">🔊 ' + pinyin + '</div>';
            if (!ocultarTraduccion) {
                html += '<div style="font-size:16px;color:var(--gray);margin-top:4px;">→ ' + traduccion + '</div>';
            } else {
                html += '<div style="font-size:13px;color:var(--warning);margin-top:4px;padding:4px 10px;background:var(--warning)08;border-radius:4px;display:inline-block;border:1px dashed var(--warning);">🔒 Traducción oculta (desmarca el checkbox para mostrarla)</div>';
            }
            
            if (palabras.length > 0) {
                html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid var(--light);">';
                for (var pi = 0; pi < palabras.length; pi++) {
                    var p = palabras[pi];
                    var texto = p.palabra || p.hanzi || '';
                    var pinyinPalabra = p.pinyin || '';
                    var significado = p.significado || '';
                    var familia = p.familia || 'sustantivo';
                    var color = window.uiCore?._getColorFamilia(familia) || '#6C5CE7';
                    html += '<span style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;border-radius:10px;background:' + color + '15;border:1px solid ' + color + '30;cursor:pointer;font-size:13px;" onclick="window.UITonos._abrirModalPalabraTonal(\'' + texto + '\', \'' + pinyinPalabra + '\', \'' + significado + '\', \'' + familia + '\', \'' + idioma + '\', \'' + nivel + '\')" onmouseover="this.style.transform=\'scale(1.05)\';this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.1)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'none\'" title="Haz clic para ver detalles y guardar en Mi Espacio">';
                    html += '<span style="font-weight:600;font-size:16px;color:' + color + ';">' + texto + '</span>';
                    if (pinyinPalabra) html += '<span style="font-size:10px;color:var(--gray-light);">' + pinyinPalabra + '</span>';
                    if (significado) html += '<span style="font-size:9px;color:var(--gray-light);">' + significado + '</span>';
                    html += '<span style="font-size:7px;color:var(--primary);margin-top:1px;">⭐</span>';
                    html += '</span>';
                }
                html += '</div>';
            } else {
                html += '<div style="font-size:10px;color:var(--gray-light);margin-top:6px;padding:4px 10px;background:var(--bg);border-radius:4px;">⚠️ Sin palabras desglosadas. Estudia la historia para generar las palabras.</div>';
            }
            html += '</div></div></div>';
        }
        
        html += '</div>';
        
        html += '<div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap;padding:12px 0;border-top:2px solid var(--light);">';
        html += '<div style="display:flex;gap:6px;align-items:center;">';
        html += '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;padding:6px 16px;background:' + (ocultarTraduccion ? 'var(--warning)15' : 'var(--bg)') + ';border-radius:8px;border:1px solid ' + (ocultarTraduccion ? 'var(--warning)' : 'var(--light)') + ';">';
        html += '<input type="checkbox" ' + (ocultarTraduccion ? 'checked' : '') + ' onchange="window.UITonos._toggleVisorTraduccion(this.checked)" style="margin:0;width:16px;height:16px;cursor:pointer;">';
        html += '<span style="color:' + (ocultarTraduccion ? 'var(--warning)' : 'var(--gray)') + ';">' + (ocultarTraduccion ? '🔒 Ocultar traducción' : '👁️ Mostrar traducción') + '</span></label></div>';
        html += '<button class="btn-primary" onclick="window.UITonos._estudiarHistoriaVisor()" style="padding:8px 24px;font-size:14px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar esta historia</button>';
        html += '<button class="btn-secondary" onclick="window.UITonos._cerrarVisorTonal()" style="padding:8px 24px;font-size:14px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-arrow-left"></i> Volver</button>';
        html += '</div>';
        
        html += '<div style="margin-top:12px;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:10px;color:var(--gray-light);text-align:center;">';
        html += '🖱️ Haz clic en cualquier palabra desglosada → Modal con información + Guardar en Mi Espacio<br>🔄 Todo retorna al Estudio de Tonos<br>🔒 Usa el checkbox para ocultar/mostrar la traducción y practicar tu comprensión';
        html += '</div></div>';
        
        container.innerHTML = html;
        this._visorAbierto = true;
    }

    _cerrarVisorTonal() {
        this._visorAbierto = false;
        this._historiaVisor = null;
        this._visorOcultarTraduccion = false;
        this._renderizarPanel();
    }

    async _estudiarHistoriaVisor() {
        if (!this._historiaVisor) {
            if (this._core) this._core.mostrarToast('❌ No hay historia para estudiar', 'error');
            return;
        }
        
        var idx = this._historiaVisor.idx;
        var caracter = this._historiaVisor.caracterKey;
        if (idx === undefined || idx === null || !caracter) {
            if (this._core) this._core.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }
        
        this._cerrarVisorTonal();
        await this._estudiarHistoriaCompleta(caracter, idx);
    }

    _abrirModalPalabraTonal(texto, pinyin, significado, familia, idioma, nivel) {
        try {
            if (window.UIStudy && typeof window.UIStudy._abrirModalGuardarPalabra === 'function') {
                window.UIStudy._abrirModalGuardarPalabra(texto, pinyin, significado, familia, idioma, nivel);
            } else {
                if (this._core) this._core.mostrarToast('📖 "' + texto + '" (' + pinyin + '): ' + significado + ' · ' + familia, 'info');
            }
        } catch (error) {
            console.warn('⚠️ Error abriendo modal de palabra:', error);
            if (this._core) this._core.mostrarToast('📖 "' + texto + '" - Guarda en Mi Espacio desde el estudio', 'info');
        }
    }

    _inyectarBotonVolverTonos() {
        if (this._botonInyectado) return;
        
        console.log('🔧 Inyectando botón "Volver a Historias Tonales" en Estudio...');
        
        var header = document.querySelector('#studyModule .module-header');
        if (!header) {
            console.warn('⚠️ No se encontró el header del módulo de estudio, reintentando...');
            setTimeout(function() { this._inyectarBotonVolverTonos(); }.bind(this), 300);
            return;
        }
        
        var btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = 'none';
            console.log('🔒 Botón "Libro de Lectura" ocultado (Modo Tonos)');
        }
        
        var titleDiv = header.querySelector('.module-title');
        if (!titleDiv) {
            var existingBtn = document.getElementById('btnVolverTonos');
            if (existingBtn) return;
            
            var btn = document.createElement('button');
            btn.id = 'btnVolverTonos';
            btn.className = 'btn-primary';
            btn.style.cssText = 'padding: 6px 16px;font-size: 12px;background: linear-gradient(135deg, #FDCB6E, #E17055);color: white;border: none;border-radius: 6px;cursor: pointer;transition: all 0.3s ease;margin-left: 12px;font-weight: 600;font-family: var(--font, sans-serif);flex-shrink: 0;';
            btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Historias Tonales';
            btn.onmouseover = function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 4px 20px rgba(225,112,85,0.3)';
            };
            btn.onmouseout = function() {
                this.style.transform = 'none';
                this.style.boxShadow = 'none';
            };
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Botón "Volver a Historias Tonales" pulsado');
                this._volverAlModoTonos();
            }.bind(this);
            header.appendChild(btn);
            window._volverAlModoTonos = function() {
                this._volverAlModoTonos();
            }.bind(this);
            this._botonInyectado = true;
            console.log('✅ Botón "Volver a Historias Tonales" añadido');
            return;
        }
        
        if (document.getElementById('btnVolverTonos')) {
            this._botonInyectado = true;
            return;
        }
        
        var btn2 = document.createElement('button');
        btn2.id = 'btnVolverTonos';
        btn2.className = 'btn-primary';
        btn2.style.cssText = 'padding: 6px 16px;font-size: 12px;background: linear-gradient(135deg, #FDCB6E, #E17055);color: white;border: none;border-radius: 6px;cursor: pointer;transition: all 0.3s ease;margin-left: 12px;font-weight: 600;font-family: var(--font, sans-serif);flex-shrink: 0;';
        btn2.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Historias Tonales';
        btn2.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 4px 20px rgba(225,112,85,0.3)';
        };
        btn2.onmouseout = function() {
            this.style.transform = 'none';
            this.style.boxShadow = 'none';
        };
        btn2.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botón "Volver a Historias Tonales" pulsado');
            this._volverAlModoTonos();
        }.bind(this);
        
        titleDiv.appendChild(btn2);
        window._volverAlModoTonos = function() {
            this._volverAlModoTonos();
        }.bind(this);
        this._botonInyectado = true;
        console.log('✅ Botón "Volver a Historias Tonales" añadido al módulo de estudio');
    }

    async _volverAlModoTonos() {
        console.log('🔄 Volviendo al Modo Tonos...');
        
        try {
            if (this._historiaEnEstudio !== null && this._historiaEnEstudio !== undefined) {
                var caracter = this._historiaEnEstudio.caracter;
                var idx = this._historiaEnEstudio.idx;
                if (caracter && idx !== undefined) {
                    var historias = this._historiasPorCaracter[caracter] || [];
                    var historia = historias[idx];
                    
                    if (historia) {
                        var todasCompletadas = true;
                        var frasesTotales = 0;
                        var frasesCompletadas = 0;
                        
                        if (historia.id) {
                            var frasesDB = await db.obtenerFrasesPorHistoria(historia.id);
                            frasesTotales = frasesDB.length;
                            for (var fi = 0; fi < frasesDB.length; fi++) {
                                var progreso = await db.obtenerProgreso(frasesDB[fi].id);
                                if (progreso && (progreso.estado === 'completada' || progreso.rcn >= 4)) {
                                    frasesCompletadas++;
                                } else {
                                    todasCompletadas = false;
                                }
                            }
                        }
                        
                        if (todasCompletadas && frasesTotales > 0) {
                            console.log('✅ Historia "' + historia.titulo + '" completada (' + frasesCompletadas + '/' + frasesTotales + ')');
                            historia.completada = true;
                            
                            if (historia.id) {
                                var historiaDB = await db.get('historias', historia.id);
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
                                            idioma: this._obtenerIdiomaActual() || 'zh',
                                            completado: true,
                                            origen: 'tonos'
                                        }
                                    }));
                                    
                                    if (this._core) this._core.mostrarToast('✅ "' + historia.titulo + '" completada!', 'success');
                                }
                            }
                            this._guardarEstadoCompleto();
                        } else if (frasesTotales > 0) {
                            console.log('📊 Progreso de "' + historia.titulo + '": ' + frasesCompletadas + '/' + frasesTotales);
                        }
                    }
                }
            }
            
            this._estudiandoHistoriaCompleta = false;
            this._historiaEnEstudio = null;
            
            if (window.pipeline) {
                pipeline._estudiandoHistoria = false;
                pipeline._historiaIdActual = null;
                pipeline._origenHistoria = null;
                pipeline._caracterKey = null;
                pipeline._historiaIdx = null;
            }
            
            var btnVolver = document.getElementById('btnVolverTonos');
            if (btnVolver) btnVolver.remove();
            
            var btnLibro = document.getElementById('btnLibroLectura');
            if (btnLibro) btnLibro.style.display = '';
            
            this._botonInyectado = false;
            
            if (this._core) {
                this._core.irAModulo('tonos');
                setTimeout(function() {
                    this._renderizarPanel();
                    if (this._historiaEnEstudio !== null) {
                        this._core?.mostrarToast('✅ Historia completada. Volviendo a Historias Tonales', 'success');
                    } else {
                        this._core?.mostrarToast('🔄 Volviendo a Historias Tonales', 'info');
                    }
                    this._historiaEnEstudio = null;
                }.bind(this), 300);
            }
            
        } catch (error) {
            console.error('❌ Error en _volverAlModoTonos:', error);
            if (this._core) this._core.mostrarToast('❌ Error al volver al Modo Tonos', 'error');
        }
    }

    _calcularEstadisticas() {
        try {
            var caracteresRaiz = this._caracteresRaizCache || this._generarCaracteresEjemplo();
            var totalCaracteres = caracteresRaiz ? caracteresRaiz.length : 0;
            
            var totalHistorias = 0;
            for (var key in this._historiasPorCaracter) {
                totalHistorias += this._historiasPorCaracter[key].length;
            }
            var totalGuardadas = 0;
            var keys = Object.keys(this._historiasGuardadas);
            for (var ki = 0; ki < keys.length; ki++) {
                if (this._historiasGuardadas[keys[ki]]) totalGuardadas++;
            }
            var totalLeidas = this._historiasLeidas.size;
            
            var nivel = this._obtenerNivelRealUsuario();
            
            return {
                totalCaracteres: totalCaracteres,
                totalHistorias: totalHistorias,
                totalGuardadas: totalGuardadas,
                totalLeidas: totalLeidas,
                nivelPromedio: nivel
            };
        } catch (e) {
            return { totalCaracteres: 0, totalHistorias: 0, totalGuardadas: 0, totalLeidas: 0, nivelPromedio: 'A1' };
        }
    }

    _getContainer() {
        if (!this._container) {
            this._container = document.getElementById('tonosContent');
            if (!this._container) {
                var moduleDiv = document.getElementById('tonosModule');
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

    destroy() {
        var idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
        this._guardarEnIndexedDB(idiomaActual);
        this._initDone = false;
        console.log('🛑 UI Tonos: Destruido (estado guardado)');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UITonos = new UITonos();

console.log('🎵 UI Estudio de Tonos v7.8 - MULTIIDIOMA COMPLETO');
console.log('  🔥 CORREGIDO: Historias separadas por carácter raíz');
console.log('  🔥 CORREGIDO: Error de DB no disponible');
console.log('  🔥 Soporte multiidioma: preserva datos por idioma');
console.log('  🔥 Guarda en pipeline_tonos_estado_idioma_[idioma]');
console.log('  🔥 Guarda en IndexedDB con clave tonos_estado_[idioma]');
console.log('  🔥 Guardado automático cada 30 segundos');
console.log('  🔥 Guardado al cambiar de página, al ocultar y al cambiar de idioma');
console.log('  🔥 Cambia de idioma y vuelve sin perder progreso');
console.log('  🔥 Las historias importadas NO se marcan como leídas automáticamente');
console.log('  🔥 El checkbox "Leída" aparece desmarcado al importar');
console.log('  🔥 Todas las funcionalidades originales preservadas');