// ============================================================
// CENTINELA v15.0 - NEUROCONTROL Y SUPERVISIÓN
// ============================================================

class Centinela {
    constructor() {
        this.limites = {
            peticionesPorMinuto: 20,
            peticionesPorDia: 150,
            tokensPorDia: 150000,
            neuroFatigaMaxima: 0.8,
            maxHotfixes: 15,
            maxErroresRegistro: 50
        };
        
        this.contadores = {
            peticionesMinuto: 0,
            peticionesDia: 0,
            tokensUsados: 0,
            ultimoReset: Date.now(),
            neuroFatiga: 0,
            erroresConsecutivos: 0
        };
        
        this.modoOffline = false;
        this.offlineHasta = 0;
        this.hotfixes = [];
        this.errores = [];
        this.neuroAlertas = [];
        this.eventosSistema = [];
        this.estadoSalud = 'optimo';
        this.ultimoDiagnostico = null;
        this.tiempoActividad = 0;
        this.inicioSesion = Date.now();
        this._initDone = false;
    }

    async init() {
        if (this._initDone) return this;
        
        try {
            if (!db || !db.db) {
                console.warn('⚠️ Centinela: DB no disponible, usando valores por defecto');
                this._initDone = true;
                return this;
            }
            
            const estado = await db.getByIndex('configuracion', 'clave', 'centinela');
            if (estado && estado.length > 0 && estado[0].valor) {
                try {
                    const data = JSON.parse(estado[0].valor);
                    this.contadores = data.contadores || this.contadores;
                    this.modoOffline = data.modoOffline || false;
                    this.offlineHasta = data.offlineHasta || 0;
                    this.neuroAlertas = data.neuroAlertas || [];
                    this.hotfixes = data.hotfixes || [];
                    this.estadoSalud = data.estadoSalud || 'optimo';
                    this.eventosSistema = data.eventosSistema || [];
                } catch (e) {
                    console.warn('⚠️ Centinela: Error parseando estado', e);
                }
            }
            
            setInterval(() => this._resetearContadores(), 60000);
            setInterval(() => this._monitoreoSalud(), 300000);
            setInterval(() => this._limpiarHistorial(), 86400000);
            
            console.log('🛡️ Centinela Neuro: Activado y supervisando');
            this._initDone = true;
            return this;
        } catch (error) {
            console.error('❌ Centinela: Error en init', error);
            this._initDone = true;
            return this;
        }
    }

    async _monitoreoSalud() {
        try {
            const stats = await db.obtenerEstadisticasNeuro();
            const estadoPipeline = pipeline.getEstado();
            
            let salud = 'optimo';
            const problemas = [];
            
            if (this.contadores.neuroFatiga > 0.6) {
                salud = 'fatiga';
                problemas.push('Fatiga cognitiva elevada');
            }
            
            if (stats.eficiencia < 30) {
                salud = 'bajo_rendimiento';
                problemas.push('Baja eficiencia de aprendizaje');
            }
            
            if (estadoPipeline.progreso < 10 && stats.totalFrases > 20) {
                salud = 'estancado';
                problemas.push('Progreso estancado');
            }
            
            if (this.contadores.erroresConsecutivos > 5) {
                salud = 'critico';
                problemas.push('Múltiples errores consecutivos');
            }
            
            this.estadoSalud = salud;
            
            if (problemas.length > 0) {
                this._registrarAlerta('salud', problemas.join(', '));
            }
            
        } catch (error) {
            console.warn('⚠️ Centinela: Error en monitoreo', error);
        }
    }

    _resetearContadores() {
        const ahora = Date.now();
        if (ahora - this.contadores.ultimoReset > 60000) {
            this.contadores.peticionesMinuto = 0;
            this.contadores.ultimoReset = ahora;
            this.contadores.neuroFatiga = Math.max(0, (this.contadores.neuroFatiga || 0) - 0.05);
            this.contadores.erroresConsecutivos = Math.max(0, (this.contadores.erroresConsecutivos || 0) - 1);
        }
        this._guardarEstado();
    }

    _limpiarHistorial() {
        const limite = Date.now() - 604800000;
        this.eventosSistema = this.eventosSistema.filter(e => e.timestamp > limite);
        this.errores = this.errores.slice(-this.limites.maxErroresRegistro);
        this.neuroAlertas = this.neuroAlertas.slice(-20);
        this._guardarEstado();
    }

    async _guardarEstado() {
        try {
            if (!db || !db.db) {
                console.warn('⚠️ Centinela: DB no disponible para guardar');
                return;
            }
            
            const data = {
                contadores: this.contadores,
                modoOffline: this.modoOffline,
                offlineHasta: this.offlineHasta,
                neuroAlertas: this.neuroAlertas.slice(-20),
                hotfixes: this.hotfixes.slice(-this.limites.maxHotfixes),
                estadoSalud: this.estadoSalud,
                eventosSistema: this.eventosSistema.slice(-100),
                ultimoDiagnostico: this.ultimoDiagnostico,
                tiempoActividad: this.tiempoActividad + (Date.now() - this.inicioSesion)
            };
            
            try {
                const existing = await db.getByIndex('configuracion', 'clave', 'centinela');
                if (existing && existing.length > 0 && existing[0].id) {
                    await db.update('configuracion', { ...existing[0], valor: JSON.stringify(data) });
                } else {
                    await db.add('configuracion', { clave: 'centinela', valor: JSON.stringify(data) });
                }
            } catch (e) {
                console.warn('⚠️ Centinela: Error guardando en DB', e);
            }
        } catch (error) {
            console.warn('⚠️ Centinela: Error guardando estado', error);
        }
    }

    _registrarEvento(tipo, descripcion, datos = {}) {
        this.eventosSistema.push({
            timestamp: Date.now(),
            tipo,
            descripcion,
            datos,
            salud: this.estadoSalud
        });
        this._guardarEstado();
    }

    _registrarAlerta(tipo, mensaje) {
        this.neuroAlertas.push({
            timestamp: Date.now(),
            tipo,
            mensaje,
            estadoSalud: this.estadoSalud
        });
        
        window.dispatchEvent(new CustomEvent('alertaCentinela', {
            detail: { tipo, mensaje }
        }));
        
        this._guardarEstado();
    }

    verificarLímites(tokensEstimados = 1500) {
        this.tiempoActividad += Date.now() - this.inicioSesion;
        this.inicioSesion = Date.now();

        if (this.modoOffline) {
            if (Date.now() < this.offlineHasta) {
                return { 
                    permitido: false, 
                    razon: 'offline', 
                    tiempoRestante: this.offlineHasta - Date.now(),
                    mensaje: `📴 Modo offline por ${Math.round((this.offlineHasta - Date.now()) / 1000)}s`
                };
            }
            this.modoOffline = false;
            this.offlineHasta = 0;
            this._registrarEvento('online', 'Sistema vuelve a estar online');
        }

        if (this.contadores.neuroFatiga > this.limites.neuroFatigaMaxima) {
            return { 
                permitido: false, 
                razon: 'fatiga_neuro', 
                tiempoRestante: 30000,
                mensaje: '🧠 Fatiga cognitiva máxima alcanzada'
            };
        }

        if (this.contadores.peticionesMinuto >= this.limites.peticionesPorMinuto * 0.9) {
            return { 
                permitido: false, 
                razon: 'minuto',
                mensaje: `⏱️ Límite de peticiones/minuto (${this.limites.peticionesPorMinuto})`
            };
        }
        
        if (this.contadores.peticionesDia >= this.limites.peticionesPorDia * 0.9) {
            return { 
                permitido: false, 
                razon: 'dia',
                mensaje: `📅 Límite de peticiones/día (${this.limites.peticionesPorDia})`
            };
        }
        
        if (this.contadores.tokensUsados + tokensEstimados >= this.limites.tokensPorDia * 0.9) {
            return { 
                permitido: false, 
                razon: 'tokens',
                mensaje: `🔢 Límite de tokens/día (${this.limites.tokensPorDia})`
            };
        }
        
        return { permitido: true };
    }

    registrarPeticion(tokens = 1500, exito = true) {
        this.contadores.peticionesMinuto++;
        this.contadores.peticionesDia++;
        this.contadores.tokensUsados += tokens;
        this.contadores.neuroFatiga = Math.min(1, (this.contadores.neuroFatiga || 0) + 0.02);
        
        if (!exito) {
            this.contadores.erroresConsecutivos++;
            this._registrarEvento('error_peticion', `Fallo en petición (${tokens} tokens)`);
        } else {
            this.contadores.erroresConsecutivos = Math.max(0, this.contadores.erroresConsecutivos - 0.5);
        }
        
        this._guardarEstado();
    }

    activarOffline(duracion = 60000, razon = '') {
        this.modoOffline = true;
        this.offlineHasta = Date.now() + duracion;
        this._registrarEvento('offline', razon || 'Modo offline activado');
        this._registrarAlerta('offline', razon || 'Sistema en modo offline');
        
        console.warn(`🛡️ Centinela: Modo offline neuro por ${duracion/1000}s - ${razon}`);
        
        window.dispatchEvent(new CustomEvent('modoOffline', { 
            detail: { duracion, razon } 
        }));
        
        this._guardarEstado();
        
        setTimeout(() => {
            this.modoOffline = false;
            this.offlineHasta = 0;
            this._registrarEvento('online', 'Sistema restaurado');
            window.dispatchEvent(new CustomEvent('modoOnline'));
            this._guardarEstado();
        }, duracion);
    }

    aplicarHotfix(descripcion, codigo) {
        const hotfix = {
            id: Date.now(),
            descripcion,
            codigo,
            timestamp: Date.now(),
            aplicado: true
        };
        
        this.hotfixes.push(hotfix);
        this._registrarEvento('hotfix', descripcion);
        
        if (this.hotfixes.length > this.limites.maxHotfixes) {
            this.hotfixes = this.hotfixes.slice(-this.limites.maxHotfixes);
        }
        
        this._guardarEstado();
        return hotfix;
    }

    validarJSON(jsonData) {
        const errores = [];
        const warnings = [];
        
        if (!jsonData.meta) {
            errores.push('Falta campo "meta"');
        } else {
            if (!jsonData.meta.idioma) warnings.push('Falta idioma en meta');
            if (!jsonData.meta.nivel) warnings.push('Falta nivel en meta');
        }
        
        if (!jsonData.historias || !Array.isArray(jsonData.historias)) {
            errores.push('Falta campo "historias" o no es array');
        }
        
        if (errores.length > 0) {
            this._registrarAlerta('validacion', `JSON inválido: ${errores.join(', ')}`);
        }
        
        if (jsonData.historias && Array.isArray(jsonData.historias)) {
            for (let i = 0; i < jsonData.historias.length; i++) {
                const historia = jsonData.historias[i];
                if (!historia.titulo) warnings.push(`Historia ${i+1}: sin título`);
                if (!historia.frases || !Array.isArray(historia.frases)) {
                    errores.push(`Historia ${i+1}: faltan frases`);
                    continue;
                }
                for (let j = 0; j < historia.frases.length; j++) {
                    const frase = historia.frases[j];
                    if (!frase.original) errores.push(`Historia ${i+1}, Frase ${j+1}: falta "original"`);
                    if (!frase.traduccion) errores.push(`Historia ${i+1}, Frase ${j+1}: falta "traduccion"`);
                    
                    if (jsonData.meta?.es_jeroglifico) {
                        if (!frase.segmentacion) {
                            errores.push(`Historia ${i+1}, Frase ${j+1}: falta "segmentacion"`);
                        } else {
                            if (!frase.segmentacion.hanzi) errores.push(`Historia ${i+1}, Frase ${j+1}: falta "segmentacion.hanzi"`);
                            if (!frase.segmentacion.pinyin) errores.push(`Historia ${i+1}, Frase ${j+1}: falta "segmentacion.pinyin"`);
                        }
                    }
                    
                    if (!frase.palabras || !Array.isArray(frase.palabras)) {
                        warnings.push(`Historia ${i+1}, Frase ${j+1}: sin palabras desglosadas`);
                    }
                }
            }
        }
        
        return { 
            valido: errores.length === 0, 
            errores,
            warnings,
            tieneWarnings: warnings.length > 0
        };
    }

    async diagnosticar() {
        try {
            const usuario = await db.getUsuario();
            const frases = await db.obtenerFrases();
            const palabras = await db.obtenerPalabras();
            const progreso = await db.obtenerTodoProgreso();
            const historias = await db.obtenerHistorias();
            const chat = await db.obtenerChat();
            
            const rcnTotal = progreso.reduce((acc, p) => acc + (p.rcn || 0), 0);
            const rcnPromedio = progreso.length > 0 ? rcnTotal / progreso.length : 0;
            const completadas = progreso.filter(p => p.estado === 'completada').length;
            
            const diag = {
                timestamp: Date.now(),
                sistema: {
                    db: !!db.db,
                    vigia: window.vigia?.enLinea || false,
                    modoOffline: this.modoOffline,
                    hotfixes: this.hotfixes.length,
                    estadoSalud: this.estadoSalud,
                    tiempoActividad: Math.round(this.tiempoActividad / 60000)
                },
                datos: {
                    usuarios: usuario ? 1 : 0,
                    frases: frases.length,
                    palabras: palabras.length,
                    historias: historias.length,
                    progreso: progreso.length,
                    chat: chat.length,
                    completadas
                },
                neuro: {
                    rcnPromedio: Math.round(rcnPromedio * 10) / 10,
                    eficiencia: this._calcularEficiencia(progreso),
                    fasePromedio: progreso.reduce((acc, p) => acc + (p.fase || 1), 0) / (progreso.length || 1),
                    consolidacion: completadas / (frases.length || 1),
                    fatiga: Math.round((this.contadores.neuroFatiga || 0) * 100)
                },
                limites: {
                    peticionesMinuto: this.contadores.peticionesMinuto,
                    peticionesDia: this.contadores.peticionesDia,
                    tokensUsados: this.contadores.tokensUsados,
                    limiteTokens: this.limites.tokensPorDia,
                    porcentajeTokens: Math.round((this.contadores.tokensUsados / this.limites.tokensPorDia) * 100),
                    neuroFatiga: Math.round((this.contadores.neuroFatiga || 0) * 100),
                    erroresConsecutivos: this.contadores.erroresConsecutivos
                },
                alertas: this.neuroAlertas.slice(-5),
                ultimosEventos: this.eventosSistema.slice(-5)
            };
            
            this.ultimoDiagnostico = diag;
            this._guardarEstado();
            
            return diag;
            
        } catch (error) {
            console.error('❌ Centinela: Error en diagnóstico', error);
            return {
                error: true,
                mensaje: error.message,
                timestamp: Date.now()
            };
        }
    }

    _calcularEficiencia(progreso) {
        const exitosos = progreso.reduce((acc, p) => acc + (p.repasosExitosos || 0), 0);
        const fallidos = progreso.reduce((acc, p) => acc + (p.repasosFallidos || 0), 0);
        const total = exitosos + fallidos;
        return total > 0 ? Math.round((exitosos / total) * 100) : 0;
    }

    async obtenerReporteSalud() {
        const diag = await this.diagnosticar();
        
        return {
            estado: this.estadoSalud,
            mensaje: this._getMensajeSalud(),
            detalles: diag,
            recomendaciones: this._getRecomendaciones(diag)
        };
    }

    _getMensajeSalud() {
        const mensajes = {
            'optimo': '✅ Sistema funcionando de manera óptima',
            'fatiga': '🧠 Fatiga cognitiva detectada - considera tomar un descanso',
            'bajo_rendimiento': '📉 Bajo rendimiento - revisa el método de estudio',
            'estancado': '🔄 Progreso estancado - prueba cambiar de estrategia',
            'critico': '⚠️ Estado crítico - se recomienda reiniciar fase'
        };
        return mensajes[this.estadoSalud] || '❓ Estado desconocido';
    }

    _getRecomendaciones(diag) {
        const recs = [];
        
        if (diag.neuro.fatiga > 60) {
            recs.push('🧠 Tomar un descanso de 5-10 minutos');
        }
        if (diag.neuro.eficiencia < 40) {
            recs.push('📖 Revisar las palabras que más fallas');
        }
        if (diag.neuro.consolidacion < 0.3 && diag.datos.frases > 10) {
            recs.push('🔄 Repasar frases antiguas');
        }
        if (diag.limites.porcentajeTokens > 80) {
            recs.push('⏳ Límite de tokens cercano - considera usar modo offline');
        }
        if (diag.sistema.modoOffline) {
            recs.push('📴 Modo offline activo - espera a que se restaure');
        }
        
        return recs;
    }

    resetearContadorDiario() {
        this.contadores.peticionesDia = 0;
        this.contadores.tokensUsados = 0;
        this._guardarEstado();
        this._registrarEvento('reset_diario', 'Contadores diarios reseteados');
    }

    obtenerEstado() {
        return {
            modoOffline: this.modoOffline,
            estadoSalud: this.estadoSalud,
            neuroFatiga: Math.round((this.contadores.neuroFatiga || 0) * 100),
            peticionesMinuto: this.contadores.peticionesMinuto,
            tokensUsados: this.contadores.tokensUsados,
            hotfixes: this.hotfixes.length,
            alertas: this.neuroAlertas.length
        };
    }
}

const centinela = new Centinela();