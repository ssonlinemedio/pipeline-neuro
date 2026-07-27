// ============================================================
// GESTOR DE FAVORITOS v1.8 - ESTRUCTURA JERÁRQUICA POR NIVEL + FAMILIA
// ============================================================

class GestorFavoritos {
    constructor() {
        this._favoritos = {
            frases: [],
            palabras: []
        };
        this._grupos = {};
        this._initDone = false;
        this._gruposCargados = false;
        this._ultimaRecarga = 0;
        this._cargando = false;
        this._usuarioId = null;
        this._NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init() {
        if (this._initDone && Date.now() - this._ultimaRecarga < 5000) return this;
        
        console.log('📚 Gestor de Favoritos v1.8: Inicializando...');
        await this._cargarFavoritos();
        await this._cargarGrupos();
        this._initDone = true;
        this._ultimaRecarga = Date.now();
        console.log('✅ Gestor de Favoritos v1.8 inicializado');
        console.log(`   📂 Grupos: ${Object.keys(this._grupos).length}`);
        console.log(`   📚 Frases: ${this._favoritos.frases.length}`);
        console.log(`   📝 Palabras: ${this._favoritos.palabras.length}`);
        return this;
    }

    // ============================================================
    // RECARGAR DATOS - FORZADO
    // ============================================================

    async recargar() {
        if (this._cargando) {
            console.log('⏳ Ya está recargando, espera...');
            return this;
        }
        
        this._cargando = true;
        console.log('🔄 Recargando favoritos y grupos...');
        
        try {
            await this._cargarFavoritos();
            await this._cargarGrupos();
            this._initDone = true;
            this._ultimaRecarga = Date.now();
            console.log('✅ Recarga completada');
        } catch (e) {
            console.error('❌ Error en recarga:', e);
        } finally {
            this._cargando = false;
        }
        
        return this;
    }

    // ============================================================
    // OBTENER USUARIO SEGURO
    // ============================================================

    async _getUsuarioSeguro() {
        try {
            let usuario = await db.getUsuario();
            if (usuario) {
                this._usuarioId = usuario.id;
                return usuario;
            }
            
            const localData = localStorage.getItem('pipeline_usuario');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed && parsed.nombre) {
                    console.log('📦 Usuario recuperado desde localStorage:', parsed.nombre);
                    try {
                        await db.guardarUsuario(parsed);
                        this._usuarioId = parsed.id;
                    } catch (e) {}
                    return parsed;
                }
            }
            return null;
        } catch (e) {
            console.warn('⚠️ Error obteniendo usuario:', e);
            try {
                const localData = localStorage.getItem('pipeline_usuario');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed && parsed.nombre) return parsed;
                }
            } catch (e2) {}
            return null;
        }
    }

    // ============================================================
    // CARGAR FAVORITOS
    // ============================================================

    async _cargarFavoritos() {
        try {
            const usuario = await this._getUsuarioSeguro();
            
            if (usuario && usuario.id) {
                this._usuarioId = usuario.id;
                const config = await db.getConfiguracionUsuario(usuario.id);
                if (config?.favoritos) {
                    this._favoritos = config.favoritos;
                    console.log('📚 Favoritos cargados desde IndexedDB');
                    localStorage.setItem('pipeline_favoritos', JSON.stringify(this._favoritos));
                    return;
                }
            }
            
            const localData = localStorage.getItem('pipeline_favoritos');
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    if (parsed && (parsed.frases !== undefined || parsed.palabras !== undefined)) {
                        this._favoritos = parsed;
                        console.log('📚 Favoritos cargados desde localStorage');
                        if (usuario && usuario.id) {
                            try {
                                const config = await db.getConfiguracionUsuario(usuario.id) || { usuarioId: usuario.id };
                                config.favoritos = this._favoritos;
                                await db.guardarConfiguracionUsuario(config);
                                console.log('💾 Favoritos migrados a IndexedDB');
                            } catch (e) {}
                        }
                        return;
                    }
                } catch (e) {
                    console.warn('⚠️ Error parseando localStorage favoritos:', e);
                }
            }
            
            console.log('📚 No hay favoritos guardados');
            this._favoritos = { frases: [], palabras: [] };
            
        } catch (e) {
            console.warn('⚠️ Error cargando favoritos:', e);
            this._favoritos = { frases: [], palabras: [] };
        }
    }

    async guardarFavoritos() {
        try {
            const usuario = await this._getUsuarioSeguro();
            if (usuario && usuario.id) {
                const config = await db.getConfiguracionUsuario(usuario.id) || { usuarioId: usuario.id };
                config.favoritos = this._favoritos;
                await db.guardarConfiguracionUsuario(config);
                console.log('💾 Favoritos guardados en IndexedDB');
            }
            localStorage.setItem('pipeline_favoritos', JSON.stringify(this._favoritos));
        } catch (e) {
            console.warn('⚠️ Error guardando favoritos:', e);
            try {
                localStorage.setItem('pipeline_favoritos', JSON.stringify(this._favoritos));
            } catch (e2) {}
        }
    }

    // ============================================================
    // CARGAR GRUPOS - ESTRUCTURA JERÁRQUICA
    // ============================================================

    async _cargarGrupos() {
        try {
            const usuario = await this._getUsuarioSeguro();
            
            if (usuario && usuario.id) {
                this._usuarioId = usuario.id;
                const config = await db.getConfiguracionUsuario(usuario.id);
                if (config?.gruposFavoritos) {
                    this._grupos = config.gruposFavoritos;
                    this._gruposCargados = true;
                    console.log('📂 Grupos cargados desde IndexedDB:', Object.keys(this._grupos));
                    localStorage.setItem('pipeline_grupos', JSON.stringify(this._grupos));
                    return;
                }
            }
            
            const localData = localStorage.getItem('pipeline_grupos');
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        this._grupos = parsed;
                        this._gruposCargados = true;
                        console.log('📂 Grupos cargados desde localStorage:', Object.keys(this._grupos));
                        
                        if (usuario && usuario.id) {
                            try {
                                const config = await db.getConfiguracionUsuario(usuario.id) || { usuarioId: usuario.id };
                                config.gruposFavoritos = this._grupos;
                                await db.guardarConfiguracionUsuario(config);
                                console.log('💾 Grupos migrados a IndexedDB');
                            } catch (e) {}
                        }
                        return;
                    }
                } catch (e) {
                    console.warn('⚠️ Error parseando localStorage grupos:', e);
                }
            }
            
            // 🔥 CREAR ESTRUCTURA JERÁRQUICA POR NIVEL SI NO HAY GRUPOS
            if (this._favoritos.palabras.length > 0 || this._favoritos.frases.length > 0) {
                console.log('📂 No hay grupos, creando estructura jerárquica por nivel...');
                this._grupos = {};
                this._gruposCargados = true;
                
                // Crear grupos por nivel
                for (const nivel of this._NIVELES) {
                    this._grupos[`📚 Nivel ${nivel}`] = { frases: [], palabras: [] };
                }
                
                // Crear grupos por familia dentro de cada nivel
                // Esto se hace dinámicamente al añadir palabras
                
                await this._guardarGrupos();
            } else {
                console.log('📂 No hay grupos guardados');
                this._grupos = {};
                this._gruposCargados = true;
            }
            
        } catch (e) {
            console.warn('⚠️ Error cargando grupos:', e);
            this._grupos = {};
            this._gruposCargados = true;
        }
    }

    async _guardarGrupos() {
        try {
            const usuario = await this._getUsuarioSeguro();
            if (usuario && usuario.id) {
                const config = await db.getConfiguracionUsuario(usuario.id) || { usuarioId: usuario.id };
                config.gruposFavoritos = this._grupos;
                await db.guardarConfiguracionUsuario(config);
                console.log('💾 Grupos guardados en IndexedDB:', Object.keys(this._grupos));
            }
            localStorage.setItem('pipeline_grupos', JSON.stringify(this._grupos));
        } catch (e) {
            console.warn('⚠️ Error guardando grupos:', e);
            try {
                localStorage.setItem('pipeline_grupos', JSON.stringify(this._grupos));
            } catch (e2) {}
        }
    }

    // ============================================================
    // AÑADIR PALABRA A GRUPO JERÁRQUICO
    // ============================================================

    async añadirPalabraAGrupo(palabraId, nombreGrupo) {
        if (!palabraId || !nombreGrupo) return false;

        if (!this._favoritos.palabras.includes(palabraId)) {
            await this.añadirPalabra(palabraId);
        }

        // 🔥 CREAR EL GRUPO SI NO EXISTE
        if (!this._grupos[nombreGrupo]) {
            this._grupos[nombreGrupo] = { frases: [], palabras: [] };
        }

        if (!this._grupos[nombreGrupo].palabras.includes(palabraId)) {
            this._grupos[nombreGrupo].palabras.push(palabraId);
            await this._guardarGrupos();
            console.log(`✅ Palabra ${palabraId} añadida al grupo "${nombreGrupo}"`);
            return true;
        }
        return false;
    }

    // ============================================================
    // OBTENER GRUPOS CON ESTRUCTURA JERÁRQUICA
    // ============================================================

    async obtenerGruposFavoritos() {
        if (!this._gruposCargados || Object.keys(this._grupos).length === 0) {
            console.log('📂 Grupos no cargados, recargando...');
            await this._cargarGrupos();
        }
        
        if (Object.keys(this._grupos).length === 0) {
            try {
                const localData = localStorage.getItem('pipeline_grupos');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        this._grupos = parsed;
                        this._gruposCargados = true;
                        const usuario = await this._getUsuarioSeguro();
                        if (usuario && usuario.id) {
                            try {
                                const config = await db.getConfiguracionUsuario(usuario.id) || { usuarioId: usuario.id };
                                config.gruposFavoritos = this._grupos;
                                await db.guardarConfiguracionUsuario(config);
                            } catch (e) {}
                        }
                    }
                }
            } catch (e) {}
        }
        
        const gruposConDatos = {};

        for (const [nombre, grupo] of Object.entries(this._grupos)) {
            gruposConDatos[nombre] = {
                frases: [],
                palabras: []
            };

            for (const id of grupo.frases || []) {
                try {
                    const frase = await db.get('frases', id);
                    if (frase) {
                        gruposConDatos[nombre].frases.push(frase);
                    }
                } catch (e) {
                    console.warn(`⚠️ Error obteniendo frase ${id}:`, e);
                }
            }

            for (const id of grupo.palabras || []) {
                try {
                    const palabra = await db.get('palabras', id);
                    if (palabra) {
                        gruposConDatos[nombre].palabras.push(palabra);
                    }
                } catch (e) {
                    console.warn(`⚠️ Error obteniendo palabra ${id}:`, e);
                }
            }
        }

        // Limpiar grupos vacíos
        for (const [nombre, datos] of Object.entries(gruposConDatos)) {
            if (datos.frases.length === 0 && datos.palabras.length === 0) {
                delete gruposConDatos[nombre];
                delete this._grupos[nombre];
            }
        }

        if (Object.keys(gruposConDatos).length !== Object.keys(this._grupos).length) {
            await this._guardarGrupos();
        }

        return gruposConDatos;
    }

    obtenerNombresGrupos() {
        if (Object.keys(this._grupos).length === 0) {
            try {
                const localData = localStorage.getItem('pipeline_grupos');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed && typeof parsed === 'object') {
                        this._grupos = parsed;
                    }
                }
            } catch (e) {}
        }
        return Object.keys(this._grupos);
    }

    async obtenerGrupo(nombreGrupo) {
        if (!this._grupos[nombreGrupo]) return null;
        const grupo = this._grupos[nombreGrupo];
        const resultado = { frases: [], palabras: [] };
        
        for (const id of grupo.frases || []) {
            try {
                const frase = await db.get('frases', id);
                if (frase) resultado.frases.push(frase);
            } catch (e) {}
        }
        
        for (const id of grupo.palabras || []) {
            try {
                const palabra = await db.get('palabras', id);
                if (palabra) resultado.palabras.push(palabra);
            } catch (e) {}
        }
        
        return resultado;
    }

    // ============================================================
    // MÉTODOS DE FAVORITOS (mantenidos)
    // ============================================================

    async añadirFrase(fraseId) {
        if (!fraseId) return false;
        try {
            const frase = await db.get('frases', fraseId);
            if (!frase) {
                console.warn(`⚠️ Frase ${fraseId} no existe en DB`);
                return false;
            }
            if (!this._favoritos.frases.includes(fraseId)) {
                this._favoritos.frases.push(fraseId);
                await this.guardarFavoritos();
                window.dispatchEvent(new CustomEvent('favoritoActualizado', {
                    detail: { tipo: 'frase', id: fraseId, accion: 'añadir' }
                }));
                return true;
            }
            return false;
        } catch (e) {
            console.error('❌ Error añadiendo frase:', e);
            return false;
        }
    }

    async eliminarFrase(fraseId) {
        const index = this._favoritos.frases.indexOf(fraseId);
        if (index > -1) {
            this._favoritos.frases.splice(index, 1);
            for (const [nombre, grupo] of Object.entries(this._grupos)) {
                const idx = grupo.frases.indexOf(fraseId);
                if (idx > -1) {
                    grupo.frases.splice(idx, 1);
                }
            }
            await this.guardarFavoritos();
            await this._guardarGrupos();
            window.dispatchEvent(new CustomEvent('favoritoActualizado', {
                detail: { tipo: 'frase', id: fraseId, accion: 'eliminar' }
            }));
            return true;
        }
        return false;
    }

    async añadirPalabra(palabraId) {
        if (!palabraId) return false;
        try {
            const palabra = await db.get('palabras', palabraId);
            if (!palabra) {
                console.warn(`⚠️ Palabra ${palabraId} no existe en DB`);
                return false;
            }
            if (!this._favoritos.palabras.includes(palabraId)) {
                this._favoritos.palabras.push(palabraId);
                await this.guardarFavoritos();
                window.dispatchEvent(new CustomEvent('favoritoActualizado', {
                    detail: { tipo: 'palabra', id: palabraId, accion: 'añadir' }
                }));
                return true;
            }
            return false;
        } catch (e) {
            console.error('❌ Error añadiendo palabra:', e);
            return false;
        }
    }

    async eliminarPalabra(palabraId) {
        const index = this._favoritos.palabras.indexOf(palabraId);
        if (index > -1) {
            this._favoritos.palabras.splice(index, 1);
            for (const [nombre, grupo] of Object.entries(this._grupos)) {
                const idx = grupo.palabras.indexOf(palabraId);
                if (idx > -1) {
                    grupo.palabras.splice(idx, 1);
                }
            }
            await this.guardarFavoritos();
            await this._guardarGrupos();
            window.dispatchEvent(new CustomEvent('favoritoActualizado', {
                detail: { tipo: 'palabra', id: palabraId, accion: 'eliminar' }
            }));
            return true;
        }
        return false;
    }

    async obtenerFrasesFavoritas() {
        try {
            const frases = [];
            for (const id of this._favoritos.frases) {
                try {
                    const frase = await db.get('frases', id);
                    if (frase) frases.push(frase);
                } catch (e) {
                    console.warn('⚠️ Error obteniendo frase:', id);
                }
            }
            return frases;
        } catch (e) {
            console.warn('⚠️ Error obteniendo frases favoritas:', e);
            return [];
        }
    }

    async obtenerPalabrasFavoritas() {
        try {
            const palabras = [];
            for (const id of this._favoritos.palabras) {
                try {
                    const palabra = await db.get('palabras', id);
                    if (palabra) palabras.push(palabra);
                } catch (e) {
                    console.warn('⚠️ Error obteniendo palabra:', id);
                }
            }
            return palabras;
        } catch (e) {
            console.warn('⚠️ Error obteniendo palabras favoritas:', e);
            return [];
        }
    }

    async estaEnFavoritos(tipo, id) {
        if (tipo === 'frase') {
            return this._favoritos.frases.includes(id);
        } else if (tipo === 'palabra') {
            return this._favoritos.palabras.includes(id);
        }
        return false;
    }

    async toggleFavorito(tipo, id) {
        if (tipo === 'frase') {
            if (await this.estaEnFavoritos('frase', id)) {
                return await this.eliminarFrase(id);
            } else {
                return await this.añadirFrase(id);
            }
        } else if (tipo === 'palabra') {
            if (await this.estaEnFavoritos('palabra', id)) {
                return await this.eliminarPalabra(id);
            } else {
                return await this.añadirPalabra(id);
            }
        }
        return false;
    }

    async contarFavoritos() {
        if (this._favoritos.frases.length === 0 && this._favoritos.palabras.length === 0) {
            await this._cargarFavoritos();
        }
        return {
            frases: this._favoritos.frases.length,
            palabras: this._favoritos.palabras.length
        };
    }

    async limpiarTodo() {
        this._favoritos = { frases: [], palabras: [] };
        this._grupos = {};
        await this.guardarFavoritos();
        await this._guardarGrupos();
        localStorage.removeItem('pipeline_favoritos');
        localStorage.removeItem('pipeline_grupos');
        console.log('🗑️ Todos los favoritos y grupos eliminados');
        return true;
    }

    async generarGruposConVigia(idioma) {
        // Mantenido igual
        if (window.vigia && window.vigia.enLinea) {
            const frases = await this.obtenerFrasesFavoritas();
            const palabras = await this.obtenerPalabrasFavoritas();
            
            if (frases.length === 0 && palabras.length === 0) {
                return { error: 'No hay frases ni palabras para agrupar' };
            }
            
            const frasesTexto = frases.map(f => {
                const texto = f.original || 'Sin texto';
                const traduc = f.traduccion || 'Sin traducción';
                return `"${texto}" → "${traduc}"`;
            }).join('\n');
            
            const palabrasTexto = palabras.map(p => {
                const texto = p.palabra || p.hanzi || 'Sin texto';
                const sig = p.significado || 'Sin significado';
                return `${texto} (${sig})`;
            }).join(', ');
            
            const prompt = `
Agrupa las siguientes frases y palabras en una estructura jerárquica: NIVEL → FAMILIA SEMÁNTICA.

Niveles disponibles: A1, A2, B1, B2, C1, C2

Frases:
${frasesTexto}

Palabras:
${palabrasTexto}

Devuelve un JSON con grupos donde cada grupo tenga: nombreNivel, nombreFamilia, palabras (IDs) y frases (IDs).

Ejemplo:
{
  "📚 Nivel A1": {
    "frases": [],
    "palabras": []
  },
  "📂 Transporte": {
    "frases": [],
    "palabras": []
  }
}
`;
            
            try {
                const grupos = await window.vigia._consultarGroq(prompt, 'json');
                if (grupos) {
                    this._grupos = grupos;
                    await this._guardarGrupos();
                    return grupos;
                }
            } catch (e) {
                console.warn('⚠️ Error generando grupos con Vigía:', e);
            }
        }
        
        return this.obtenerGruposFavoritos();
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

if (!window.gestorFavoritos) {
    window.gestorFavoritos = new GestorFavoritos();
    console.log('✅ Gestor de Favoritos v1.8 - Estructura jerárquica por NIVEL + FAMILIA');
}