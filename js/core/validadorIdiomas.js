// ============================================================
// VALIDADOR DE IDIOMAS v1.0 - UNA SOLA LLAMADA A GROQ
// ============================================================

class ValidadorIdiomas {
    constructor() {
        this._cache = {};
        this._cacheKey = 'pipeline_idiomas_validados';
        this._cargarCache();
    }

    _cargarCache() {
        try {
            const data = localStorage.getItem(this._cacheKey);
            if (data) {
                this._cache = JSON.parse(data);
            }
        } catch (e) {
            this._cache = {};
        }
    }

    _guardarCache() {
        try {
            localStorage.setItem(this._cacheKey, JSON.stringify(this._cache));
        } catch (e) {}
    }

    // ============================================================
    // 🔥 LA ÚNICA FUNCIÓN QUE NECESITAS
    // ============================================================

    async validar(texto, tipo = 'nativo') {
        const key = texto.trim().toLowerCase();
        
        // 1. Caché local
        if (this._cache[key]) {
            console.log(`📌 "${texto}" → ${this._cache[key].idiomaFinal} (caché)`);
            return this._cache[key];
        }

        // 2. Validar con Groq (UNA SOLA LLAMADA)
        let resultado = {
            original: texto.trim(),
            idiomaFinal: texto.trim(),
            valido: true,
            mensaje: 'Idioma aceptado',
            corregido: false
        };

        if (window.vigia && window.vigia.enLinea) {
            try {
                console.log(`🔍 Validando "${texto}" con Groq...`);
                
                const prompt = `
Eres un experto en idiomas.

El usuario escribió: "${texto.trim()}"

Tarea:
1. Si es un idioma real, devuélvelo en español (ej: "english" → "inglés")
2. Si es un error tipográfico, corrígelo (ej: "inglish" → "inglés")
3. Si no existe, dímelo

Responde SOLO en JSON:
{
    "valido": true/false,
    "idiomaCorregido": "idioma_en_español_o_null",
    "mensaje": "texto_para_el_usuario"
}`;

                const respuesta = await window.vigia._consultarGroq(prompt, 'json');
                
                if (respuesta) {
                    resultado.valido = respuesta.valido !== false;
                    if (respuesta.idiomaCorregido && respuesta.idiomaCorregido !== texto.trim()) {
                        resultado.idiomaFinal = respuesta.idiomaCorregido;
                        resultado.corregido = true;
                        resultado.mensaje = respuesta.mensaje || `✏️ Corregido a "${respuesta.idiomaCorregido}"`;
                    } else {
                        resultado.mensaje = respuesta.mensaje || '✅ Idioma válido';
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error en Groq, aceptando idioma:', e);
            }
        }

        // 3. Guardar en caché
        this._cache[key] = resultado;
        this._guardarCache();

        return resultado;
    }

    // ============================================================
    // 🔥 GUARDAR EN INDEXEDDB Y LOCALSTORAGE
    // ============================================================

    async guardar(idiomaFinal, tipo = 'nativo') {
        try {
            const usuario = await db.getUsuario();
            if (!usuario) return false;

            if (tipo === 'nativo') {
                usuario.idiomaNativo = idiomaFinal;
            } else {
                if (!usuario.idiomasObjetivo) usuario.idiomasObjetivo = [];
                const existe = usuario.idiomasObjetivo.some(i => i.idioma === idiomaFinal);
                if (!existe) {
                    usuario.idiomasObjetivo.push({
                        idioma: idiomaFinal,
                        nivel: 'B1',
                        versionEstandar: 'v3.0'
                    });
                }
            }

            // GUARDAR EN INDEXEDDB
            await db.guardarUsuario(usuario);

            // GUARDAR EN LOCALSTORAGE
            try {
                const local = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
                if (tipo === 'nativo') {
                    local.idiomaNativo = idiomaFinal;
                } else {
                    if (!local.idiomasObjetivo) local.idiomasObjetivo = [];
                    const existe = local.idiomasObjetivo.some(i => i.idioma === idiomaFinal);
                    if (!existe) {
                        local.idiomasObjetivo.push({
                            idioma: idiomaFinal,
                            nivel: 'B1',
                            versionEstandar: 'v3.0'
                        });
                    }
                }
                localStorage.setItem('pipeline_usuario', JSON.stringify(local));
            } catch (e) {}

            console.log(`✅ "${idiomaFinal}" guardado como ${tipo}`);
            return true;

        } catch (e) {
            console.error('❌ Error guardando:', e);
            return false;
        }
    }

    // ============================================================
    // LIMPIAR CACHÉ
    // ============================================================

    limpiarCache() {
        this._cache = {};
        localStorage.removeItem(this._cacheKey);
        console.log('🧹 Caché limpiada');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.validadorIdiomas = new ValidadorIdiomas();

console.log('✅ Validador de Idiomas v1.0 - UNA LLAMADA A GROQ');