// ============================================================
// GRAMATICA v2.0 - MÓDULO COMPLETO PARA PIPELINE NEURO
// ============================================================

class Gramatica {
    constructor() {
        this.palabras = [];
        this.familias = {};
        this.familiasSemanticas = {};
        this.palabrasPorNivel = {};
        this._initDone = false;
        this._idiomaActual = null;
        this._clusters = null;
        this._tendencias = null;
        this._ultimaActualizacion = 0;
        this._tiempoCache = 30000; // 30 segundos
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init() {
        if (this._initDone) return this;
        console.log('📚 Gramática v2.0: Inicializando...');
        
        try {
            await this.cargarPalabras();
            await this.agrupar();
            await this._calcularNeuroCluster();
            await this._calcularTendencias();
            this._initDone = true;
            this._ultimaActualizacion = Date.now();
            console.log('✅ Gramática v2.0 inicializada correctamente');
        } catch (e) {
            console.warn('⚠️ Error en init de gramática:', e);
            this._initDone = true;
        }
        
        return this;
    }

    // ============================================================
    // CARGA DE PALABRAS
    // ============================================================

    async cargarPalabras() {
        try {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            this._idiomaActual = idiomaActivo;
            this.palabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
            
            // Clasificar por nivel
            this.palabrasPorNivel = {};
            for (const p of this.palabras) {
                const nivel = p.nivel || 'A1';
                if (!this.palabrasPorNivel[nivel]) {
                    this.palabrasPorNivel[nivel] = [];
                }
                this.palabrasPorNivel[nivel].push(p);
            }
            
            console.log(`📚 ${this.palabras.length} palabras cargadas para "${idiomaActivo}"`);
            console.log(`   Distribución por nivel:`, Object.keys(this.palabrasPorNivel).map(n => `${n}: ${this.palabrasPorNivel[n].length}`).join(', '));
        } catch (e) {
            console.warn('⚠️ Error cargando palabras:', e);
            this.palabras = [];
            this.palabrasPorNivel = {};
        }
        return this.palabras;
    }

    // ============================================================
    // AGRUPACIÓN POR FAMILIAS
    // ============================================================

    async agrupar() {
        this.familias = {};
        this.familiasSemanticas = {};
        
        for (const p of this.palabras) {
            // Familia gramatical
            const familia = p.familia || p.familiaGramatical || 'sin_clasificar';
            if (!this.familias[familia]) {
                this.familias[familia] = [];
            }
            this.familias[familia].push(p);
            
            // Familia semántica
            const familiaSemantica = p.familiaSemantica || p.familia || 'sin_clasificar';
            if (!this.familiasSemanticas[familiaSemantica]) {
                this.familiasSemanticas[familiaSemantica] = [];
            }
            this.familiasSemanticas[familiaSemantica].push(p);
        }
        
        // Ordenar cada familia por frecuencia
        for (const [key, arr] of Object.entries(this.familias)) {
            this.familias[key] = arr.sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0));
        }
        for (const [key, arr] of Object.entries(this.familiasSemanticas)) {
            this.familiasSemanticas[key] = arr.sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0));
        }
        
        console.log(`📚 ${Object.keys(this.familias).length} familias gramaticales agrupadas`);
        console.log(`📚 ${Object.keys(this.familiasSemanticas).length} familias semánticas agrupadas`);
        return this.familias;
    }

    // ============================================================
    // NEURO CLUSTERS
    // ============================================================

    async _calcularNeuroCluster() {
        const clusters = {
            altas: [],
            medias: [],
            bajas: [],
            nuevas: [],
            porFamilia: {}
        };
        
        for (const p of this.palabras) {
            try {
                const progreso = await db.obtenerProgreso(p.id);
                const rcn = progreso?.rcn || 0;
                const familia = p.familia || p.familiaGramatical || 'sin_clasificar';
                
                // Clasificar la palabra
                let categoria = 'nuevas';
                if (rcn >= 3.5) categoria = 'altas';
                else if (rcn >= 2) categoria = 'medias';
                else if (rcn >= 0.5) categoria = 'bajas';
                
                clusters[categoria].push(p);
                
                // Por familia
                if (!clusters.porFamilia[familia]) {
                    clusters.porFamilia[familia] = { altas: 0, medias: 0, bajas: 0, nuevas: 0 };
                }
                clusters.porFamilia[familia][categoria]++;
                
            } catch (e) {}
        }
        
        this._clusters = clusters;
        return clusters;
    }

    // ============================================================
    // TENDENCIAS
    // ============================================================

    async _calcularTendencias() {
        const tendencias = {
            palabrasNuevas: 0,
            palabrasDominadas: 0,
            palabrasEnProgreso: 0,
            palabrasOlvidadas: 0,
            eficienciaGeneral: 0,
            rachaPromedio: 0,
            totalEstudiadas: 0,
            porNivel: {}
        };
        
        let totalRCN = 0;
        let contador = 0;
        let totalRacha = 0;
        let contadorRacha = 0;
        
        for (const p of this.palabras) {
            try {
                const progreso = await db.obtenerProgreso(p.id);
                if (progreso && progreso.rcn !== undefined) {
                    const rcn = progreso.rcn;
                    const nivel = p.nivel || 'A1';
                    
                    totalRCN += rcn;
                    contador++;
                    
                    if (rcn >= 4) tendencias.palabrasDominadas++;
                    else if (rcn >= 2) tendencias.palabrasEnProgreso++;
                    else if (rcn >= 0.5) tendencias.palabrasOlvidadas++;
                    else tendencias.palabrasNuevas++;
                    
                    // Racha
                    if (progreso.repasosExitosos && progreso.repasosExitosos > 0) {
                        const racha = progreso.repasosExitosos - (progreso.repasosFallidos || 0);
                        if (racha > 0) {
                            totalRacha += racha;
                            contadorRacha++;
                        }
                    }
                    
                    // Por nivel
                    if (!tendencias.porNivel[nivel]) {
                        tendencias.porNivel[nivel] = { total: 0, dominadas: 0, enProgreso: 0 };
                    }
                    tendencias.porNivel[nivel].total++;
                    if (rcn >= 4) tendencias.porNivel[nivel].dominadas++;
                    else if (rcn >= 2) tendencias.porNivel[nivel].enProgreso++;
                }
            } catch (e) {}
        }
        
        tendencias.totalEstudiadas = contador;
        tendencias.eficienciaGeneral = contador > 0 ? Math.round((totalRCN / contador) * 20) : 0;
        tendencias.rachaPromedio = contadorRacha > 0 ? Math.round(totalRacha / contadorRacha) : 0;
        
        // Calcular porcentajes por nivel
        for (const [nivel, data] of Object.entries(tendencias.porNivel)) {
            data.porcentajeDominadas = data.total > 0 ? Math.round((data.dominadas / data.total) * 100) : 0;
        }
        
        this._tendencias = tendencias;
        return tendencias;
    }

    // ============================================================
    // RECARGAR PARA IDIOMA
    // ============================================================

    async recargarParaIdioma(idioma) {
        console.log(`🔄 Recargando gramática para "${idioma}"...`);
        this._idiomaActual = idioma;
        this._ultimaActualizacion = 0;
        await this.cargarPalabras();
        await this.agrupar();
        await this._calcularNeuroCluster();
        await this._calcularTendencias();
        this._ultimaActualizacion = Date.now();
        console.log(`✅ Gramática recargada para "${idioma}"`);
        return this;
    }

    // ============================================================
    // GETTERS
    // ============================================================

    getPalabras() {
        return this.palabras;
    }

    getFamilias() {
        return this.familias;
    }

    getFamiliasSemanticas() {
        return this.familiasSemanticas;
    }

    getPalabrasPorNivel(nivel) {
        if (nivel) return this.palabrasPorNivel[nivel] || [];
        return this.palabrasPorNivel;
    }

    getClusters() {
        return this._clusters;
    }

    getTendencias() {
        return this._tendencias;
    }

    getPalabrasPorFamilia(familia) {
        return this.familias[familia] || [];
    }

    getPalabrasPorFamiliaSemantica(familia) {
        return this.familiasSemanticas[familia] || [];
    }

    getFamiliasConPalabras() {
        const resultado = {};
        for (const [familia, palabras] of Object.entries(this.familias)) {
            if (palabras && palabras.length > 0) {
                resultado[familia] = palabras.length;
            }
        }
        return resultado;
    }

    getTotalPalabras() {
        return this.palabras.length;
    }

    getTotalFamilias() {
        return Object.keys(this.familias).length;
    }

    getTotalFamiliasSemanticas() {
        return Object.keys(this.familiasSemanticas).length;
    }

    getDistribucionPorNivel() {
        const distribucion = {};
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        for (const nivel of niveles) {
            const palabras = this.palabrasPorNivel[nivel] || [];
            if (palabras.length > 0) {
                distribucion[nivel] = palabras.length;
            }
        }
        return distribucion;
    }

    // ============================================================
    // BÚSQUEDA
    // ============================================================

    buscarPalabras(termino) {
        if (!termino || termino.length < 2) return [];
        const terminoLower = termino.toLowerCase().trim();
        
        return this.palabras.filter(p => {
            const texto = (p.palabra || p.hanzi || '').toLowerCase();
            const significado = (p.significado || '').toLowerCase();
            const pinyin = (p.pinyin || '').toLowerCase();
            return texto.includes(terminoLower) || 
                   significado.includes(terminoLower) ||
                   pinyin.includes(terminoLower);
        });
    }

    buscarPorFamilia(familia) {
        if (!familia) return [];
        return this.familias[familia] || [];
    }

    buscarPorFamiliaSemantica(familia) {
        if (!familia) return [];
        return this.familiasSemanticas[familia] || [];
    }

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    async obtenerEstadisticas() {
        if (this._ultimaActualizacion === 0 || Date.now() - this._ultimaActualizacion > this._tiempoCache) {
            await this._calcularTendencias();
            this._ultimaActualizacion = Date.now();
        }
        
        const tendencias = this._tendencias || {};
        const familias = this.getFamiliasConPalabras();
        
        const familiasOrdenadas = Object.entries(familias)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        return {
            totalPalabras: this.palabras.length,
            totalFamilias: Object.keys(this.familias).length,
            totalFamiliasSemanticas: Object.keys(this.familiasSemanticas).length,
            distribucionNivel: this.getDistribucionPorNivel(),
            tendencias: tendencias,
            topFamilias: familiasOrdenadas,
            clusters: this._clusters,
            idioma: this._idiomaActual,
            ultimaActualizacion: this._ultimaActualizacion
        };
    }

    // ============================================================
    // MÉTODOS PARA COMPATIBILIDAD CON UIStudy
    // ============================================================

    _getColorFamilia(familia) {
        const colores = {
            'sustantivo': '#6C5CE7',
            'verbo': '#00B894',
            'adjetivo': '#FDCB6E',
            'adverbio': '#74B9FF',
            'preposición': '#FF7675',
            'conjunción': '#A29BFE',
            'pronombre': '#55EFC4',
            'determinante': '#0984E3',
            'interjección': '#E17055',
            'numeral': '#00CEC9',
            'clasificador': '#636E72',
            'partícula': '#636E72',
            'expresión': '#FDCB6E',
            'conector': '#74B9FF',
            'sin_clasificar': '#DFE6E9',
            'Transporte': '#0984E3',
            'Comida y Bebida': '#E17055',
            'Familia': '#6C5CE7',
            'Casa y Hogar': '#00CEC9',
            'Ropa': '#FD79A8',
            'Animales': '#00B894',
            'Naturaleza': '#55EFC4',
            'Tiempo y Clima': '#74B9FF',
            'Salud': '#FF7675',
            'Trabajo': '#636E72',
            'Educación': '#A29BFE',
            'Deportes': '#FDCB6E',
            'Arte': '#E17055',
            'Música': '#FD79A8',
            'Tecnología': '#0984E3',
            'Viajes': '#00CEC9',
            'Compras': '#FDCB6E',
            'Comunicación': '#74B9FF',
            'Emociones': '#FF7675',
            'Rutina': '#636E72',
            'Ciudad': '#00B894',
            'Cultura': '#6C5CE7',
            'Historia': '#E17055',
            'Ciencia': '#0984E3'
        };
        return colores[familia] || '#6C5CE7';
    }

    // ============================================================
    // MÉTODOS PARA COMPATIBILIDAD CON UI.TEMAS
    // ============================================================

    async obtenerPalabrasDelTema(temaId) {
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) return [];
            
            const historias = await db.obtenerHistoriasPorTema(temaId);
            const palabrasSet = new Set();
            
            for (const h of historias) {
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                for (const f of frases) {
                    if (f.palabras && Array.isArray(f.palabras)) {
                        for (const p of f.palabras) {
                            if (p.palabra || p.hanzi) {
                                palabrasSet.add(JSON.stringify(p));
                            }
                        }
                    }
                }
            }
            
            return Array.from(palabrasSet).map(p => JSON.parse(p));
        } catch (e) {
            console.warn('⚠️ Error obteniendo palabras del tema:', e);
            return [];
        }
    }

    // ============================================================
    // MÉTODOS PARA COMPATIBILIDAD CON UI.GRAMMAR
    // ============================================================

    getFamiliasGramaticales() {
        return Object.keys(this.familias);
    }

    getFamiliasSemanticasList() {
        return Object.keys(this.familiasSemanticas);
    }

    getPalabrasPorNivelYFamilia(nivel, familia) {
        if (!nivel || !familia) return [];
        
        const palabrasNivel = this.palabrasPorNivel[nivel] || [];
        return palabrasNivel.filter(p => {
            const fam = p.familia || p.familiaGramatical || 'sin_clasificar';
            return fam === familia;
        });
    }

    getPalabrasPorNivelYFamiliaSemantica(nivel, familia) {
        if (!nivel || !familia) return [];
        
        const palabrasNivel = this.palabrasPorNivel[nivel] || [];
        return palabrasNivel.filter(p => {
            const fam = p.familiaSemantica || p.familia || 'sin_clasificar';
            return fam === familia;
        });
    }

    // ============================================================
    // LIMPIEZA DE CACHÉ
    // ============================================================

    limpiarCache() {
        this._ultimaActualizacion = 0;
        this._clusters = null;
        this._tendencias = null;
        console.log('🧹 Caché de gramática limpiada');
    }

    // ============================================================
    // EXPORTAR DATOS
    // ============================================================

    exportarDatos() {
        return {
            palabras: this.palabras,
            familias: this.familias,
            familiasSemanticas: this.familiasSemanticas,
            palabrasPorNivel: this.palabrasPorNivel,
            clusters: this._clusters,
            tendencias: this._tendencias,
            idioma: this._idiomaActual,
            totalPalabras: this.palabras.length,
            totalFamilias: Object.keys(this.familias).length,
            totalFamiliasSemanticas: Object.keys(this.familiasSemanticas).length,
            fechaExportacion: new Date().toISOString(),
            version: '2.0'
        };
    }

    // ============================================================
    // IMPORTAR DATOS
    // ============================================================

    importarDatos(data) {
        if (!data || !data.palabras) {
            console.warn('⚠️ Datos inválidos para importar');
            return false;
        }
        
        try {
            this.palabras = data.palabras || [];
            this.familias = data.familias || {};
            this.familiasSemanticas = data.familiasSemanticas || {};
            this.palabrasPorNivel = data.palabrasPorNivel || {};
            this._idiomaActual = data.idioma || this._idiomaActual;
            this._ultimaActualizacion = Date.now();
            console.log(`✅ ${this.palabras.length} palabras importadas`);
            return true;
        } catch (e) {
            console.warn('⚠️ Error importando datos:', e);
            return false;
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

const gramatica = new Gramatica();

// Inicialización automática después de que la DB esté lista
async function initGramatica() {
    try {
        // Esperar a que la DB esté lista
        if (!db._initialized) {
            await db.init();
        }
        await gramatica.init();
    } catch (e) {
        console.warn('⚠️ Error en init automático de gramática:', e);
        // Reintentar después de 2 segundos
        setTimeout(() => {
            initGramatica();
        }, 2000);
    }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGramatica);
} else {
    initGramatica();
}

console.log('✅ Gramática v2.0 - Módulo completo cargado');
console.log('  📚 Métodos principales:');
console.log('    - init()');
console.log('    - cargarPalabras()');
console.log('    - agrupar()');
console.log('    - recargarParaIdioma(idioma)');
console.log('    - buscarPalabras(termino)');
console.log('    - getPalabras()');
console.log('    - getFamilias()');
console.log('    - getFamiliasSemanticas()');
console.log('    - getPalabrasPorNivel(nivel)');
console.log('    - _calcularNeuroCluster()');
console.log('    - _calcularTendencias()');
console.log('    - _getColorFamilia(familia)');
console.log('  📊 Estadísticas:');
console.log('    - obtenerEstadisticas()');
console.log('    - exportarDatos()');
console.log('    - importarDatos(data)');