// ============================================================
// UI TEMAS ACTIONS v2.10 - INDEPENDIENTE POR IDIOMA
// ============================================================

class UITemasActions {
    // ============================================================
    // ESTUDIAR TEMA
    // ============================================================

    static async estudiarTema(temaId) {
        const core = window.UITemas._core;
        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        if (tema.idioma && tema.idioma !== idiomaActivo) {
            core?.mostrarToast('⚠️ Este tema es de "' + tema.idioma + '", cambiando a "' + idiomaActivo + '"...', 'warning');
            tema.idioma = idiomaActivo;
            await db.actualizarTema(temaId, { idioma: idiomaActivo });
        }

        await pipeline.estudiarTema(temaId);
    }

    // ============================================================
    // ESTUDIAR HISTORIA
    // ============================================================

    static async estudiarHistoria(historiaId) {
        const core = window.UITemas._core;
        if (!historiaId) {
            core?.mostrarToast('❌ Historia no especificada', 'error');
            return;
        }

        const historia = await db.get('historias', historiaId);
        if (!historia) {
            core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        if (historia.idioma && historia.idioma !== idiomaActivo) {
            core?.mostrarToast('⚠️ Esta historia es de "' + historia.idioma + '", no de "' + idiomaActivo + '"', 'warning');
            historia.idioma = idiomaActivo;
            await db.update('historias', historia);
        }

        await pipeline.estudiarHistoria(historiaId);
    }

    // ============================================================
    // EXPORTAR TEMA (CON VERSIÓN)
    // ============================================================

    static async exportarTema(temaId) {
        const core = window.UITemas._core;
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) {
                core?.mostrarToast('❌ Tema no encontrado', 'error');
                return;
            }

            const historias = await db.obtenerHistoriasPorTema(temaId);
            const data = {
                meta: {
                    nombre: tema.nombre,
                    descripcion: tema.descripcion || '',
                    idioma: tema.idioma,
                    nivel: tema.nivel,
                    icono: tema.icono || '📁',
                    version_estandar: tema._version_estandar || 'v2.0',
                    nombre_version: tema._nombre_version || 'Estándar',
                    fechaExportacion: new Date().toISOString(),
                    version: '22.0'
                },
                historias: []
            };

            for (const h of historias) {
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                data.historias.push({
                    id: h.id,
                    titulo: h.titulo,
                    nivel: h.nivel,
                    version_estandar: h._version_estandar || data.meta.version_estandar,
                    frases: frases.map(f => ({
                        original: f.original,
                        traduccion: f.traduccion,
                        palabras: f.palabras || [],
                        pinyin: f.pinyinCompleto || f.segmentacion?.pinyin || '',
                        transcripcion: f.transcripcion || '',
                        segmentacion: f.segmentacion || null,
                        regla_gramatical: f.reglaGramatical || null,
                        explicacion_gramatical: f.explicacionGramatical || null,
                        tipo_regla: f.tipoRegla || null,
                        version_estandar: f._version_estandar || data.meta.version_estandar
                    }))
                });
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tema_' + tema.nombre + '_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);

            core?.mostrarToast('✅ Tema exportado con versión ' + data.meta.nombre_version, 'success');
        } catch (error) {
            console.error('❌ Error exportando tema:', error);
            core?.mostrarToast('❌ Error exportando tema', 'error');
        }
    }

    // ============================================================
    // EXPORTAR HISTORIA (CON VERSIÓN)
    // ============================================================

    static async exportarHistoria(historiaId) {
        const core = window.UITemas._core;
        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                core?.mostrarToast('❌ Historia no encontrada', 'error');
                return;
            }

            const frases = await db.obtenerFrasesPorHistoria(historiaId);
            const data = {
                meta: {
                    titulo: historia.titulo,
                    idioma: historia.idioma,
                    nivel: historia.nivel,
                    version_estandar: historia._version_estandar || 'v2.0',
                    nombre_version: historia._nombre_version || 'Estándar',
                    fechaExportacion: new Date().toISOString(),
                    version: '22.0'
                },
                historias: [{
                    titulo: historia.titulo,
                    nivel: historia.nivel,
                    version_estandar: historia._version_estandar || 'v2.0',
                    frases: frases.map(f => ({
                        original: f.original,
                        traduccion: f.traduccion,
                        palabras: f.palabras || [],
                        pinyin: f.pinyinCompleto || f.segmentacion?.pinyin || '',
                        transcripcion: f.transcripcion || '',
                        segmentacion: f.segmentacion || null,
                        regla_gramatical: f.reglaGramatical || null,
                        explicacion_gramatical: f.explicacionGramatical || null,
                        tipo_regla: f.tipoRegla || null,
                        version_estandar: f._version_estandar || data.meta.version_estandar
                    }))
                }]
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'historia_' + historia.titulo + '_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);

            core?.mostrarToast('✅ Historia exportada con versión ' + data.meta.nombre_version, 'success');
        } catch (error) {
            console.error('❌ Error exportando historia:', error);
            core?.mostrarToast('❌ Error exportando historia', 'error');
        }
    }

    // ============================================================
    // ELIMINAR TEMA
    // ============================================================

    static async eliminarTema(temaId) {
        const core = window.UITemas._core;
        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        const confirmar = await core?.confirm(
            '⚠️ ¿Estás seguro de eliminar el tema "' + tema.nombre + '"?\n\nSe eliminarán TODAS las historias y frases asociadas.\n\nEsta acción NO se puede deshacer.',
            'Eliminar Tema'
        );

        if (!confirmar) return;

        await db.eliminarTema(temaId);
        core?.mostrarToast('🗑️ Tema "' + tema.nombre + '" eliminado', 'warning');
        window.UITemas._renderTemas();
    }

    // ============================================================
    // ELIMINAR HISTORIA DE UN TEMA
    // ============================================================

    static async eliminarHistoriaDeTema(historiaId) {
        const core = window.UITemas._core;
        const historia = await db.get('historias', historiaId);
        if (!historia) {
            core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }

        const confirmar = await core?.confirm(
            '⚠️ ¿Eliminar la historia "' + (historia.titulo || 'Sin título') + '"?\n\nSe eliminarán TODAS las frases asociadas.\n\nEsta acción no se puede deshacer.',
            'Eliminar Historia'
        );

        if (!confirmar) return;

        const temaId = historia.temaId;
        const tema = temaId ? await db.obtenerTema(temaId) : null;

        const frases = await db.obtenerFrasesPorHistoria(historiaId);
        for (const f of frases) {
            await db.delete('frases', f.id);
        }

        await db.delete('historias', historiaId);

        if (tema && tema.historiasIds) {
            tema.historiasIds = tema.historiasIds.filter(id => id !== historiaId);
            await db.actualizarTema(temaId, {
                historiasIds: tema.historiasIds,
                frases: (tema.frases || 0) - frases.length
            });
        }

        core?.mostrarToast('🗑️ Historia eliminada', 'warning');

        if (temaId) {
            window.UITemas._verTemaDetalle(temaId);
        } else {
            window.UITemas._renderTemas();
        }
    }

    // ============================================================
    // GENERAR TEMA PREDEFINIDO (CON IDIOMA CORRECTO)
    // ============================================================

    static async generarTemaPredefinido(temaId, temaNombre, nivel) {
        const core = window.UITemas._core;
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        
        // OBTENER VERSIÓN
        const versionEstandar = window.UITemas._obtenerVersionEstandar(idiomaActivo);
        const nombreVersion = window.UITemas._obtenerNombreVersion(idiomaActivo, versionEstandar);
        const palabrasRequeridas = window.gestorIdiomas?._obtenerPalabrasPorVersion?.(idiomaActivo, versionEstandar, nivel) || 2000;

        let numTemasRecomendados = 8;
        try {
            if (typeof window.UITemas._calcularNumeroTemas === 'function') {
                numTemasRecomendados = window.UITemas._calcularNumeroTemas(versionEstandar, nivel);
            } else {
                const temasPorNivel = { 'A1': 8, 'A2': 8, 'B1': 8, 'B2': 8, 'C1': 5, 'C2': 4 };
                numTemasRecomendados = temasPorNivel[nivel] || 8;
                console.log('📌 Usando fallback para numTemasRecomendados:', numTemasRecomendados);
            }
        } catch (e) {
            console.warn('⚠️ Error calculando número de temas, usando fallback:', e);
            numTemasRecomendados = 8;
        }

        // 🔥 USAR LA NUEVA FUNCIÓN PARA OBTENER/CREAR EL TEMA CON EL IDIOMA CORRECTO
        const temaConIdioma = await window.UITemas._obtenerOCrearTemaPredefinidoPorIdioma(temaId, idiomaActivo);
        const dbId = temaConIdioma ? temaConIdioma.id : null;
        let temaGuardado = temaConIdioma;

        if (!temaGuardado) {
            core?.mostrarToast('❌ Error al guardar el tema predefinido', 'error');
            return;
        }

        const numHistorias = 3;
        const numFrases = 6;
        const esJeroglifico = window.gestorIdiomas?._esJeroglifico(idiomaActivo) || false;
        const idiomaNativo = window.UITemas._obtenerIdiomaNativo();
        const nombreNativo = window.UITemas._getNombreIdioma(idiomaNativo);
        const nombreIdioma = window.UITemas._getNombreIdioma(idiomaActivo);

        let instruccionesTranscripcion = '';
        let camposTranscripcion = {};
        
        if (esJeroglifico) {
            instruccionesTranscripcion = `
                ⚠️ IMPORTANTE PARA IDIOMAS JEROGLÍFICOS:
                - Incluye 'pinyin' CON TONOS para CADA frase y CADA palabra.
                - La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente.
                - Ejemplo: "你好" → "nǐ hǎo"
                - Ejemplo de segmentacion: {"hanzi": "我 爱 你", "pinyin": "wǒ ài nǐ"}
            `;
            camposTranscripcion = {
                "frase": "pinyin con tonos",
                "palabra": "pinyin con tonos",
                "segmentacion": "hanzi y pinyin separados"
            };
        } else {
            instruccionesTranscripcion = `
                ⚠️ IMPORTANTE PARA TRANSCRIPCIÓN FONÉTICA:
                - Incluye 'transcripcion' para CADA frase y CADA palabra.
                - La transcripción debe estar en el sistema fonético NATIVO del usuario (${nombreNativo}).
                - Debe ser FÁCIL DE LEER para un hablante nativo de ${nombreNativo}.
                - Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).
                - Separa las sílabas con espacios para facilitar la lectura.
                - Usa la aproximación más cercana para sonidos que no existen en ${nombreNativo}.
                - Para cada palabra, la transcripción debe reflejar su pronunciación individual.
            `;
            camposTranscripcion = {
                "frase": "transcripcion en " + nombreNativo,
                "palabra": "transcripcion en " + nombreNativo
            };
        }

        const template = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "22.0",
                "accion": "Genera " + numHistorias + " mini-historias sobre \"" + temaNombre + "\"",
                "idioma": idiomaActivo,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "tema": temaNombre,
                "tema_id": temaId,
                "num_historias": numHistorias,
                "max_historias": 10,
                "max_frases_por_historia": 10,
                "es_jeroglifico": esJeroglifico,
                "idioma_nativo": idiomaNativo,
                "nombre_nativo": nombreNativo,
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "num_temas_recomendados": numTemasRecomendados,
                "instrucciones": [
                    "1. Genera " + numHistorias + " mini-historias sobre \"" + temaNombre + "\"",
                    "2. Cada historia debe tener " + numFrases + " frases en " + idiomaActivo,
                    "3. El nivel de dificultad es " + nivel,
                    "4. La versión del estándar es " + nombreVersion + " (" + versionEstandar + ")",
                    "5. Este nivel requiere aproximadamente " + palabrasRequeridas + " palabras en total",
                    "6. Cada frase debe tener: 'original', 'traduccion'",
                    "7. Incluye 'regla_gramatical' y 'explicacion_gramatical' para cada frase",
                    "8. ⚠️ IMPORTANTE: Para CADA frase, incluye 'palabras' con TODAS las palabras de la frase",
                    "9. " + instruccionesTranscripcion,
                    "10. La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente",
                    "11. IMPORTANTE: Clasifica CADA palabra con su tipo gramatical correcto",
                    "12. IMPORTANTE: Genera una sección 'caracteres_destacados' con los caracteres clave del tema"
                ],
                "campos_transcripcion": camposTranscripcion,
                "formato_palabras": esJeroglifico ? {
                    "hanzi": "El carácter en el idioma objetivo",
                    "pinyin": "Pronunciación con tonos",
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": "Traducción al " + idiomaNativo
                } : {
                    "palabra": "La palabra en el idioma objetivo",
                    "transcripcion": "Transcripción fonética en " + nombreNativo,
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": "Traducción al " + idiomaNativo
                }
            },
            "meta": {
                "tema": temaNombre,
                "tema_id": temaId,
                "idioma": idiomaActivo,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "es_jeroglifico": esJeroglifico,
                "idioma_nativo": idiomaNativo,
                "nombre_nativo": nombreNativo,
                "num_historias": numHistorias,
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "fecha_generacion": new Date().toISOString(),
                "version": "22.0",
                "_esPredefinido": true,
                "_esImportado": true
            },
            "historias": []
        };

        // Crear historias con placeholders
        for (let i = 1; i <= numHistorias; i++) {
            const historia = { 
                id: i, 
                titulo: "Historia " + i + " sobre " + temaNombre, 
                frases: [] 
            };
            for (let j = 1; j <= numFrases; j++) {
                const frase = {
                    original: "Frase " + j + " en " + idiomaActivo,
                    traduccion: "Traduccion " + j + " al " + idiomaNativo,
                    regla_gramatical: "[Regla gramatical " + j + "]",
                    explicacion_gramatical: "[Explicacion " + j + " en " + idiomaNativo + "]",
                    palabras: []
                };
                
                if (esJeroglifico) {
                    frase.pinyin = "[pinyin_con_tonos_de_la_frase_" + j + "]";
                    frase.segmentacion = {
                        hanzi: "[hanzi_frase_" + j + "]",
                        pinyin: "[pinyin_frase_" + j + "]"
                    };
                    frase.palabras.push({
                        hanzi: "[hanzi_palabra_" + j + "]",
                        pinyin: "[pinyin_de_palabra_" + j + "]",
                        familia: "[familia_semantica]",
                        tipo: "[tipo_gramatical]",
                        significado: "[significado_en_" + idiomaNativo + "]"
                    });
                } else {
                    frase.transcripcion = "[transcripcion_en_" + nombreNativo + "_de_la_frase_" + j + "]";
                    frase.palabras.push({
                        palabra: "[palabra_" + j + "]",
                        transcripcion: "[transcripcion_en_" + nombreNativo + "_de_palabra_" + j + "]",
                        familia: "[familia_semantica]",
                        tipo: "[tipo_gramatical]",
                        significado: "[significado_en_" + idiomaNativo + "]"
                    });
                }
                historia.frases.push(frase);
            }
            template.historias.push(historia);
        }

        if (esJeroglifico) {
            template.caracteres_destacados = {
                "_INSTRUCCIONES": {
                    "version": "2.0",
                    "accion": "Genera caracteres destacados para el tema",
                    "tema": temaNombre,
                    "idioma": idiomaActivo,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "instrucciones": [
                        "1. Identifica los caracteres MÁS IMPORTANTES del tema",
                        "2. Para cada carácter, proporciona:",
                        "   - 'caracter': el carácter en sí",
                        "   - 'pinyin': pronunciación con tonos",
                        "   - 'significado': significado en " + idiomaNativo,
                        "   - 'frecuencia': número de veces que aparece (estimado)",
                        "   - 'palabras_relacionadas': array de palabras que usan este carácter",
                        "   - 'palabras_relacionadas_info': array con {palabra, pinyin, significado}",
                        "   - 'frases_de_la_historia': frases donde aparece el carácter"
                    ]
                },
                "lista": []
            };
        }

        localStorage.setItem('pipeline_template_tema', JSON.stringify(template));
        
        if (core) {
            core.abrirModal('📄 Plantilla de Tema - ' + temaNombre + ' - ' + nombreVersion);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.value = JSON.stringify(template, null, 2);
                textarea.readOnly = false;
                textarea.style.minHeight = '400px';
                textarea.style.fontSize = '12px';
                textarea.style.fontFamily = 'monospace';

                const importBtn = document.getElementById('jsonImport');
                if (importBtn) {
                    const newImportBtn = importBtn.cloneNode(true);
                    importBtn.parentNode.replaceChild(newImportBtn, importBtn);

                    newImportBtn.onclick = async function() {
                        const jsonText = document.getElementById('jsonTextarea').value;
                        if (jsonText) {
                            try {
                                const data = JSON.parse(jsonText);
                                await window.UITemasActions.importarTemaCompletoConLoading(data, temaId, temaNombre);
                                window.UITemas._core.cerrarModal();
                                window.UITemas._core.mostrarToast('✅ Tema importado correctamente', 'success');
                            } catch (e) {
                                window.UITemas._core.mostrarToast('❌ Error: ' + e.message, 'error');
                            }
                        }
                    };
                }
            }
        }
        
        const mensajeExtra = esJeroglifico ? 
            '⚠️ IMPORTANTE: El JSON incluye campos para PINYIN con tonos.' : 
            `🎤 IMPORTANTE: El JSON incluye campos para TRANSCRIPCIÓN FONÉTICA en ${nombreNativo}.`;
        
        core?.mostrarToast(`📄 Plantilla generada para "${temaNombre}" con ${nombreVersion}`, 'success');
        core?.mostrarToast(mensajeExtra, 'warning');
    }

    // ============================================================
    // IMPORTAR TEMA COMPLETO CON LOADING
    // ============================================================

    static async importarTemaCompletoConLoading(data, temaId, temaNombre) {
        if (!data || !data.historias || !Array.isArray(data.historias) || data.historias.length === 0) {
            throw new Error('JSON inválido: debe contener "historias"');
        }

        UITemasActions._mostrarLoading(`📥 Importando "${temaNombre}"...`);
        await new Promise(r => setTimeout(r, 300));

        try {
            const idioma = data.meta?.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
            const nivel = data.meta?.nivel || 'A1';
            const esJeroglifico = window.UITemas._esJeroglifico(idioma);
            const versionEstandar = data.meta?.version_estandar || window.UITemas._obtenerVersionEstandar(idioma);
            const nombreVersion = data.meta?.nombre_version || window.UITemas._obtenerNombreVersion(idioma, versionEstandar);

            UITemasActions._actualizarLoading(10, '📂 Preparando tema...', 'Creando estructura del tema');

            // 🔥 USAR LA NUEVA FUNCIÓN CON IDIOMA
            const temaConIdioma = await window.UITemas._obtenerOCrearTemaPredefinidoPorIdioma(temaId, idioma);
            let temaGuardado = temaConIdioma;

            if (!temaGuardado) {
                throw new Error('No se pudo crear/obtener el tema con el idioma correcto');
            }

            const temaIdReal = temaGuardado.id;
            console.log(`📂 USANDO TEMA: "${temaGuardado.nombre}" (ID: ${temaIdReal})`);
            console.log(`📌 Versión: ${temaGuardado._nombre_version || nombreVersion}`);

            let totalFrases = 0;
            let totalPalabras = 0;
            let totalReglas = 0;
            const historiasIds = [];

            UITemasActions._actualizarLoading(20, '📖 Procesando historias...', `0/${data.historias.length} historias`);

            window.UITemas._caracteresProcesados = new Set();
            window.UITemas._palabrasDerivadasProcesadas = new Set();

            let historiasProcesadas = 0;
            for (const historiaData of data.historias) {
                historiasProcesadas++;
                const progress = 20 + Math.round((historiasProcesadas / data.historias.length) * 30);
                UITemasActions._actualizarLoading(
                    progress, 
                    `📖 Procesando historias...`, 
                    `${historiasProcesadas}/${data.historias.length} historias`
                );

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

                const historiaId = await db.guardarHistoria(historiaObj);

                if (historiaId) {
                    historiasIds.push(historiaId);
                    const frases = historiaData.frases || [];
                    const frasesPorHistoria = [];

                    let frasesProcesadas = 0;
                    for (const fraseData of frases) {
                        frasesProcesadas++;
                        if (frasesProcesadas % 3 === 0) {
                            UITemasActions._actualizarLoading(
                                progress + Math.round((frasesProcesadas / frases.length) * 10),
                                `📝 Procesando frases...`,
                                `${frasesProcesadas}/${frases.length} frases en historia ${historiasProcesadas}`
                            );
                        }

                        if (!fraseData.original || !fraseData.traduccion) continue;

                        let palabrasData = fraseData.palabras || [];
                        if (typeof palabrasData === 'string') {
                            try {
                                palabrasData = JSON.parse(palabrasData);
                            } catch (e) {
                                palabrasData = [];
                            }
                        }
                        if (!Array.isArray(palabrasData)) {
                            palabrasData = [];
                        }

                        let transcripcionFrase = '';
                        if (!esJeroglifico && fraseData.transcripcion) {
                            transcripcionFrase = fraseData.transcripcion;
                        }

                        const fraseObj = {
                            original: fraseData.original,
                            traduccion: fraseData.traduccion,
                            historiaId: historiaId,
                            idioma: idioma,
                            nivel: nivel,
                            esJeroglifico: esJeroglifico,
                            pinyinCompleto: esJeroglifico ? (fraseData.pinyin || '') : '',
                            transcripcion: !esJeroglifico ? transcripcionFrase : '',
                            segmentacion: esJeroglifico && fraseData.segmentacion ? {
                                hanzi: fraseData.segmentacion.hanzi || fraseData.original,
                                pinyin: fraseData.segmentacion.pinyin || fraseData.pinyin || ''
                            } : null,
                            palabras: [],
                            rg: 0,
                            rcn: 0,
                            activa: true,
                            reglaGramatical: fraseData.regla_gramatical || null,
                            explicacionGramatical: fraseData.explicacion_gramatical || null,
                            tipoRegla: fraseData.tipo_regla || null,
                            familiaSemantica: 'Seleccionadas por Usuario',
                            _version_estandar: versionEstandar
                        };

                        const palabrasFrase = [];
                        for (const pData of palabrasData) {
                            const palabraText = pData.palabra || pData.hanzi || '';
                            if (!palabraText) continue;

                            const tipoGramatical = pData.tipo || pData.familia || 'sustantivo';
                            const familiaSemantica = pData.familiaSemantica || 'General';
                            const pinyinPalabra = pData.pinyin || '';
                            const transcripcionPalabra = pData.transcripcion || '';

                            const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                            let palabraExistente = palabrasExistentes.find(p =>
                                (p.palabra || p.hanzi || '') === palabraText
                            );

                            let palabraId;
                            if (palabraExistente) {
                                palabraId = palabraExistente.id;
                                const updateData = {
                                    ...palabraExistente,
                                    frecuencia: (palabraExistente.frecuencia || 0) + 1,
                                    pinyin: esJeroglifico ? (palabraExistente.pinyin || pinyinPalabra) : palabraExistente.pinyin,
                                    transcripcion: !esJeroglifico ? (palabraExistente.transcripcion || transcripcionPalabra) : '',
                                    _version_estandar: versionEstandar
                                };
                                await db.guardarPalabra(updateData);
                            } else {
                                const nuevaPalabra = {
                                    palabra: palabraText,
                                    hanzi: esJeroglifico ? palabraText : '',
                                    pinyin: esJeroglifico ? pinyinPalabra : '',
                                    transcripcion: !esJeroglifico ? transcripcionPalabra : '',
                                    significado: pData.significado || palabraText,
                                    familia: tipoGramatical,
                                    familias: [tipoGramatical],
                                    familiaSemantica: familiaSemantica,
                                    nivel: nivel,
                                    tipo: tipoGramatical,
                                    idioma: idioma,
                                    frecuencia: 1,
                                    neuroScore: 0.5,
                                    nivelDominio: 'nuevo',
                                    fechaCreacion: Date.now(),
                                    _version_estandar: versionEstandar
                                };
                                palabraId = await db.guardarPalabra(nuevaPalabra);
                                totalPalabras++;
                            }

                            if (palabraId) {
                                palabrasFrase.push({
                                    id: palabraId,
                                    palabra: palabraText,
                                    hanzi: esJeroglifico ? palabraText : '',
                                    pinyin: esJeroglifico ? pinyinPalabra : '',
                                    transcripcion: !esJeroglifico ? transcripcionPalabra : '',
                                    significado: pData.significado || palabraText,
                                    familia: tipoGramatical
                                });
                            }
                        }
                        fraseObj.palabras = palabrasFrase;

                        await db.guardarFrase(fraseObj);
                        totalFrases++;
                        frasesPorHistoria.push(fraseObj);

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
                            totalReglas++;
                        }
                    }

                    await db.update('historias', {
                        ...historiaObj,
                        id: historiaId,
                        frases: frasesPorHistoria.length
                    });
                }
            }

            // SINCRONIZAR CARACTERES
            let caracteresImportados = 0;
            let palabrasDerivadasGuardadas = 0;

            if (esJeroglifico && data.caracteres_destacados) {
                UITemasActions._actualizarLoading(70, '🀄 Sincronizando caracteres...', 'Extrayendo caracteres del JSON');

                try {
                    const caracteresExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                    const existentesSet = new Set(
                        caracteresExistentes
                            .filter(p => p.esCaracterRaiz === true)
                            .map(p => p.palabra || p.hanzi || '')
                    );

                    const listaCaracteres = data.caracteres_destacados.lista || [];
                    let procesados = 0;

                    if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
                        await window.gestorFavoritos.init();
                    }

                    for (const item of listaCaracteres) {
                        procesados++;
                        if (procesados % 3 === 0) {
                            UITemasActions._actualizarLoading(
                                70 + Math.round((procesados / listaCaracteres.length) * 20),
                                `🀄 Guardando caracteres (${procesados}/${listaCaracteres.length})...`,
                                `Procesando "${item.caracter}"`
                            );
                        }

                        const caracter = item.caracter;
                        if (!caracter) continue;

                        const yaExiste = existentesSet.has(caracter);
                        let idRaiz = null;

                        if (!yaExiste) {
                            const pinyin = item.pinyin || '';
                            const significado = item.significado || caracter;
                            const trazos = item.trazos || 0;
                            const radical = item.radical || '';
                            const mnemotecnia = item.mnemotecnia || `🧠 ${caracter} significa "${significado}"`;
                            const palabrasRelacionadas = item.palabras_relacionadas || [];
                            const frasesDeLaHistoria = item.frases_de_la_historia || [];

                            const raizObj = {
                                palabra: caracter,
                                hanzi: caracter,
                                pinyin: pinyin,
                                significado: significado,
                                familia: 'caracter_raiz',
                                familias: ['caracter_raiz'],
                                nivel: nivel,
                                tipo: 'caracter_raiz',
                                idioma: idioma,
                                frecuencia: item.frecuencia || 1,
                                neuroScore: 0.5,
                                nivelDominio: 'nuevo',
                                fechaCreacion: Date.now(),
                                esCaracterRaiz: true,
                                tema: temaNombre,
                                numero_trazos: trazos,
                                estructura: {
                                    trazos_clave: [],
                                    radicales: radical ? [radical] : [],
                                    tipo_estructura: window.UITemas._detectarTipoEstructura(caracter)
                                },
                                etimologia_breve: item.etimologia || '',
                                mnemotecnia: mnemotecnia,
                                variantes: null,
                                esPalabraDerivada: false,
                                caracterRaiz: null,
                                desgloseMorfologico: '',
                                desgloseCaracteres: [],
                                asociacionVisual: '',
                                ejemploFrase: frasesDeLaHistoria.length > 0 ? frasesDeLaHistoria[0] : '',
                                familiaSemanticaPrincipal: 'Caracteres Raíz',
                                temaFamilia: temaNombre,
                                _version_estandar: versionEstandar
                            };

                            try {
                                idRaiz = await db.guardarPalabra(raizObj);
                                if (idRaiz) {
                                    caracteresImportados++;
                                    existentesSet.add(caracter);
                                    
                                    try {
                                        await gestorFavoritos.añadirPalabra(idRaiz);
                                        await gestorFavoritos.añadirPalabraAGrupo(idRaiz, `📚 Nivel ${nivel}`);
                                        await gestorFavoritos.añadirPalabraAGrupo(idRaiz, '🧠 Caracteres Raíz');
                                        await gestorFavoritos.añadirPalabraAGrupo(idRaiz, `📂 ${temaNombre}`);
                                    } catch (e) {
                                        console.warn(`⚠️ Error guardando en favoritos "${caracter}":`, e);
                                    }
                                }
                            } catch (e) {
                                console.warn(`   ❌ Error guardando "${caracter}":`, e.message);
                            }
                        } else {
                            const existente = caracteresExistentes.find(p => 
                                (p.palabra || p.hanzi || '') === caracter && p.esCaracterRaiz === true
                            );
                            if (existente) {
                                idRaiz = existente.id;
                            }
                        }

                        // GUARDAR PALABRAS DERIVADAS
                        if (idRaiz && item.palabras_relacionadas) {
                            const derivadasArray = item.palabras_relacionadas || [];
                            
                            for (const palabraText of derivadasArray) {
                                if (palabraText === caracter) continue;
                                
                                const yaExisteDerivada = await db.obtenerPalabrasPorIdioma(idioma);
                                const existe = yaExisteDerivada.find(p => 
                                    (p.palabra || p.hanzi || '') === palabraText &&
                                    p.esPalabraDerivada === true &&
                                    p.caracterRaiz === caracter
                                );
                                
                                if (existe) continue;
                                
                                let pinyinDerivada = '';
                                let significadoDerivada = '';
                                if (item.palabras_relacionadas_info) {
                                    const info = item.palabras_relacionadas_info.find(p => p.palabra === palabraText);
                                    if (info) {
                                        pinyinDerivada = info.pinyin || '';
                                        significadoDerivada = info.significado || '';
                                    }
                                }
                                
                                const derivadaObj = {
                                    palabra: palabraText,
                                    hanzi: palabraText,
                                    pinyin: pinyinDerivada,
                                    significado: significadoDerivada || `Relacionado con ${caracter}`,
                                    familia: 'derivada',
                                    familias: ['derivada'],
                                    nivel: nivel,
                                    tipo: 'sustantivo',
                                    idioma: idioma,
                                    frecuencia: 1,
                                    neuroScore: 0.5,
                                    nivelDominio: 'nuevo',
                                    fechaCreacion: Date.now(),
                                    esPalabraDerivada: true,
                                    caracterRaiz: caracter,
                                    desgloseMorfologico: `Contiene el carácter "${caracter}"`,
                                    desgloseCaracteres: [
                                        { caracter: caracter, pinyin: pinyinDerivada, significado: significadoDerivada }
                                    ],
                                    asociacionVisual: `🔗 ${palabraText} contiene el carácter ${caracter}`,
                                    ejemploFrase: '',
                                    traduccionFrase: '',
                                    familiaSemanticaPrincipal: 'Caracteres Raíz',
                                    temaFamilia: temaNombre,
                                    _version_estandar: versionEstandar
                                };

                                try {
                                    const idDer = await db.guardarPalabra(derivadaObj);
                                    if (idDer) {
                                        palabrasDerivadasGuardadas++;
                                        
                                        try {
                                            await gestorFavoritos.añadirPalabra(idDer);
                                            await gestorFavoritos.añadirPalabraAGrupo(idDer, `📚 Nivel ${nivel}`);
                                            await gestorFavoritos.añadirPalabraAGrupo(idDer, '🧠 Caracteres Raíz');
                                            await gestorFavoritos.añadirPalabraAGrupo(idDer, `📂 ${temaNombre}`);
                                        } catch (e) {
                                            console.warn(`⚠️ Error guardando derivada en favoritos "${palabraText}":`, e);
                                        }
                                    }
                                } catch (e) {
                                    console.warn(`   ❌ Error guardando derivada "${palabraText}":`, e.message);
                                }
                            }
                        }
                    }

                    console.log(`✅ Sincronización: ${caracteresImportados} caracteres, ${palabrasDerivadasGuardadas} derivadas`);

                } catch (e) {
                    console.warn('⚠️ Error en sincronización de caracteres:', e);
                }
            }

            // ACTUALIZAR TEMA
            UITemasActions._actualizarLoading(97, '💾 Guardando cambios...', 'Actualizando tema');

            if (temaGuardado) {
                const todasHistoriasIds = [...new Set([...temaGuardado.historiasIds, ...historiasIds])];
                await db.update('temas', {
                    ...temaGuardado,
                    historiasIds: todasHistoriasIds,
                    frases: (temaGuardado.frases || 0) + totalFrases,
                    estado: 'en_curso',
                    _tieneContenido: true,
                    _esPredefinido: true,
                    _esImportado: true,
                    origen: 'importado',
                    _caracteresSincronizados: temaGuardado._caracteresSincronizados || false,
                    _fechaSincronizacion: temaGuardado._fechaSincronizacion || null,
                    _caracteresSincronizadosCount: temaGuardado._caracteresSincronizadosCount || 0,
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion,
                    _idioma_original: idioma
                });
            }

            // ACTUALIZAR MÓDULOS
            UITemasActions._actualizarLoading(98, '🔄 Actualizando módulos...', 'Gramática, Pipeline y Vigía');

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
                    await window.vigiaGramatical._actualizarEdadGramatical(idioma);
                } catch (e) {
                    console.warn('⚠️ Error actualizando Vigía Gramatical:', e);
                }
            }

            // ACTUALIZAR UI
            UITemasActions._actualizarLoading(99, '🔄 Actualizando interfaz...', 'Caracteres, Mi Espacio y Dashboard');

            if (window.UICaracteres) {
                window.UICaracteres._limpiarCache();
                await window.UICaracteres.recargarVistaActual();
            }

            if (window.UIEspacio) {
                await window.UIEspacio._renderizarMiEspacio();
            }

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.UITemas._core);
            }

            window.UITemas._volverTemas();

            // OCULTAR LOADING Y MOSTRAR RESUMEN
            UITemasActions._actualizarLoading(100, '✅ ¡Importación completada!', '');

            await new Promise(r => setTimeout(r, 500));
            UITemasActions._ocultarLoading();

            const mensaje = `✅ Tema "${temaNombre}" importado correctamente\n\n` +
                `📚 Historias: ${historiasIds.length}\n` +
                `📝 Frases: ${totalFrases}\n` +
                `📖 Palabras: ${totalPalabras}\n` +
                `📋 Reglas gramaticales: ${totalReglas}\n` +
                (esJeroglifico && caracteresImportados > 0 ? 
                    `\n🀄 Caracteres sincronizados: ${caracteresImportados}\n` +
                    `📝 Palabras derivadas añadidas: ${palabrasDerivadasGuardadas}` : '') +
                `\n📌 Versión: ${nombreVersion}\n` +
                `\n🌍 Idioma: ${idioma}\n` +
                `\n💡 Los caracteres están disponibles en el módulo "Caracteres" y las palabras en "Mi Espacio"`;

            window.UITemas._core?.alert(mensaje, '✅ Importación Completada');

            return { 
                historias: historiasIds.length, 
                frases: totalFrases, 
                palabras: totalPalabras,
                caracteres: caracteresImportados,
                derivadas: palabrasDerivadasGuardadas
            };

        } catch (error) {
            UITemasActions._ocultarLoading();
            console.error('❌ Error importando tema:', error);
            console.error('   Stack:', error.stack);
            
            let mensajeError = '❌ Error importando el tema: ' + error.message;
            if (error.message.includes('No se pudo guardar el tema') || error.message.includes('db.add')) {
                mensajeError += '\n\n💡 Asegúrate de que la base de datos (IndexedDB) esté funcionando correctamente.';
                mensajeError += '\n💡 Si el problema persiste, intenta recargar la página y volver a intentarlo.';
                mensajeError += '\n\n📋 Detalles técnicos: ' + error.message;
            }
            
            window.UITemas._core?.mostrarToast(mensajeError, 'error');
            throw error;
        }
    }

    // ============================================================
    // SINCORNIZAR CARACTERES TEMA
    // ============================================================

    static async sincronizarCaracteresTema(temaId) {
        const core = window.UITemas._core;
        if (!temaId) {
            core?.mostrarToast('❌ Tema no especificado', 'error');
            return;
        }

        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        const idioma = tema.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
        const esJeroglifico = window.UITemas._esJeroglifico(idioma);

        if (!esJeroglifico) {
            core?.mostrarToast('ℹ️ Este idioma no es jeroglífico. No hay caracteres para sincronizar.', 'info');
            return;
        }

        const versionEstandar = tema._version_estandar || window.UITemas._obtenerVersionEstandar(idioma);
        const nombreVersion = tema._nombre_version || window.UITemas._obtenerNombreVersion(idioma, versionEstandar);

        const yaSincronizado = tema._caracteresSincronizados === true;
        if (yaSincronizado) {
            const fecha = tema._fechaSincronizacion ? new Date(tema._fechaSincronizacion).toLocaleString() : 'desconocida';
            const numCaracteres = tema._caracteresSincronizadosCount || 0;
            const confirmar = await core?.confirm(
                `⚠️ Este tema ya fue sincronizado el **${fecha}**\n\n` +
                `Se encontraron **${numCaracteres}** caracteres.\n\n` +
                `¿Quieres volver a sincronizar? (Se añadirán nuevos caracteres)`,
                '🔄 Re-sincronizar Caracteres'
            );
            if (!confirmar) return;
        }

        const confirmar = await core?.confirm(
            `🀄 ¿Sincronizar caracteres del tema "${tema.nombre}"?\n\n` +
            `Esto:\n` +
            `• Extraerá todos los caracteres de las frases\n` +
            `• Creará caracteres raíz (si no existen)\n` +
            `• Creará palabras derivadas\n` +
            `• Guardará todo en "Mi Espacio" y "Caracteres"\n` +
            `📌 Versión: ${nombreVersion}\n\n` +
            `¿Continuar?`,
            '🀄 Sincronizar Caracteres'
        );

        if (!confirmar) return;

        UITemasActions._mostrarLoading(`🀄 Sincronizando "${tema.nombre}" con ${nombreVersion}...`);
        await new Promise(r => setTimeout(r, 300));

        try {
            // OBTENER TODAS LAS FRASES DEL TEMA
            UITemasActions._actualizarLoading(20, '📖 Extrayendo frases...', 'Cargando contenido del tema');

            const historias = await db.obtenerHistoriasPorTema(temaId);
            let totalFrases = 0;
            const todasLasFrases = [];

            for (let i = 0; i < historias.length; i++) {
                const h = historias[i];
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                totalFrases += frases.length;
                todasLasFrases.push(...frases);
                UITemasActions._actualizarLoading(
                    20 + Math.round((i + 1) / historias.length * 20),
                    `📖 Extrayendo frases...`,
                    `${i + 1}/${historias.length} historias, ${totalFrases} frases`
                );
            }

            if (todasLasFrases.length === 0) {
                UITemasActions._ocultarLoading();
                core?.mostrarToast('❌ No hay frases en este tema para sincronizar caracteres.', 'warning');
                return;
            }

            // EXTRAER CARACTERES
            UITemasActions._actualizarLoading(40, '🀄 Extrayendo caracteres...', 'Analizando las frases');

            const caracteresMap = new Map();

            for (const f of todasLasFrases) {
                const texto = f.original || '';
                const chars = texto.match(/[\u4e00-\u9fff]/g) || [];
                for (const c of chars) {
                    if (!caracteresMap.has(c)) {
                        caracteresMap.set(c, { 
                            frecuencia: 0, 
                            palabras: new Set(),
                            frases: new Set(),
                            pinyin: '',
                            significado: c
                        });
                    }
                    const dataChar = caracteresMap.get(c);
                    dataChar.frecuencia++;
                    if (f.original) dataChar.frases.add(f.original);
                    if (!dataChar.pinyin) {
                        const palabraExistente = await db.obtenerCaracterRaiz(c, idioma);
                        if (palabraExistente) {
                            dataChar.pinyin = palabraExistente.pinyin || '';
                            dataChar.significado = palabraExistente.significado || c;
                        }
                    }
                }
                
                if (f.palabras) {
                    for (const p of f.palabras) {
                        const palabra = p.palabra || p.hanzi || '';
                        if (!palabra || palabra.length < 2) continue;
                        for (const [c, dataChar] of caracteresMap) {
                            if (palabra.includes(c) && palabra !== c) {
                                dataChar.palabras.add(palabra);
                            }
                        }
                    }
                }
            }

            if (caracteresMap.size === 0) {
                UITemasActions._ocultarLoading();
                core?.mostrarToast('ℹ️ No se encontraron caracteres jeroglíficos en este tema.', 'info');
                return;
            }

            // GUARDAR CARACTERES
            UITemasActions._actualizarLoading(60, '💾 Guardando caracteres...', `${caracteresMap.size} caracteres a procesar`);

            let caracteresImportados = 0;
            let palabrasDerivadasGuardadas = 0;
            const nivel = tema.nivel || 'A1';

            if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
                await window.gestorFavoritos.init();
            }

            const caracteresExistentes = await db.obtenerPalabrasPorIdioma(idioma);
            const existentesSet = new Set(
                caracteresExistentes
                    .filter(p => p.esCaracterRaiz === true)
                    .map(p => p.palabra || p.hanzi || '')
            );

            let procesados = 0;
            for (const [caracter, dataChar] of caracteresMap) {
                procesados++;
                if (procesados % 3 === 0) {
                    UITemasActions._actualizarLoading(
                        60 + Math.round((procesados / caracteresMap.size) * 30),
                        `🀄 Guardando caracteres (${procesados}/${caracteresMap.size})...`,
                        `Procesando "${caracter}"`
                    );
                }

                const yaExiste = existentesSet.has(caracter);
                let idRaiz = null;

                if (!yaExiste) {
                    const palabrasRelacionadas = Array.from(dataChar.palabras).slice(0, 10);
                    const frasesDeLaHistoria = Array.from(dataChar.frases).slice(0, 3);
                    
                    const raizObj = {
                        palabra: caracter,
                        hanzi: caracter,
                        pinyin: dataChar.pinyin || '',
                        significado: dataChar.significado || caracter,
                        familia: 'caracter_raiz',
                        familias: ['caracter_raiz'],
                        nivel: nivel,
                        tipo: 'caracter_raiz',
                        idioma: idioma,
                        frecuencia: dataChar.frecuencia || 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esCaracterRaiz: true,
                        tema: tema.nombre,
                        numero_trazos: 0,
                        estructura: {
                            trazos_clave: [],
                            radicales: [],
                            tipo_estructura: window.UITemas._detectarTipoEstructura(caracter)
                        },
                        etimologia_breve: '',
                        mnemotecnia: `🧠 ${caracter} aparece en el tema "${tema.nombre}"`,
                        variantes: null,
                        esPalabraDerivada: false,
                        caracterRaiz: null,
                        desgloseMorfologico: '',
                        desgloseCaracteres: [],
                        asociacionVisual: '',
                        ejemploFrase: frasesDeLaHistoria.length > 0 ? frasesDeLaHistoria[0] : '',
                        familiaSemanticaPrincipal: 'Caracteres Raíz',
                        temaFamilia: tema.nombre,
                        _version_estandar: versionEstandar
                    };

                    try {
                        idRaiz = await db.guardarPalabra(raizObj);
                        if (idRaiz) {
                            caracteresImportados++;
                            existentesSet.add(caracter);
                            
                            try {
                                await gestorFavoritos.añadirPalabra(idRaiz);
                                await gestorFavoritos.añadirPalabraAGrupo(idRaiz, `📚 Nivel ${nivel}`);
                                await gestorFavoritos.añadirPalabraAGrupo(idRaiz, '🧠 Caracteres Raíz');
                                await gestorFavoritos.añadirPalabraAGrupo(idRaiz, `📂 ${tema.nombre}`);
                            } catch (e) {
                                console.warn(`⚠️ Error guardando en favoritos "${caracter}":`, e);
                            }
                        }
                    } catch (e) {
                        console.warn(`   ❌ Error guardando "${caracter}":`, e.message);
                    }
                } else {
                    const existente = caracteresExistentes.find(p => 
                        (p.palabra || p.hanzi || '') === caracter && p.esCaracterRaiz === true
                    );
                    if (existente) {
                        idRaiz = existente.id;
                        await db.guardarPalabra({
                            ...existente,
                            frecuencia: (existente.frecuencia || 0) + dataChar.frecuencia,
                            tema: tema.nombre,
                            _version_estandar: versionEstandar
                        });
                    }
                }

                // GUARDAR PALABRAS DERIVADAS
                if (idRaiz) {
                    const derivadasArray = Array.from(dataChar.palabras);
                    
                    for (const palabraText of derivadasArray) {
                        if (palabraText === caracter) continue;
                        
                        const yaExisteDerivada = await db.obtenerPalabrasPorIdioma(idioma);
                        const existe = yaExisteDerivada.find(p => 
                            (p.palabra || p.hanzi || '') === palabraText &&
                            p.esPalabraDerivada === true &&
                            p.caracterRaiz === caracter
                        );
                        
                        if (existe) continue;
                        
                        let pinyinDerivada = '';
                        let significadoDerivada = '';
                        for (const f of todasLasFrases) {
                            if (f.palabras) {
                                const pEncontrada = f.palabras.find(p => p.palabra === palabraText || p.hanzi === palabraText);
                                if (pEncontrada) {
                                    pinyinDerivada = pEncontrada.pinyin || '';
                                    significadoDerivada = pEncontrada.significado || '';
                                    break;
                                }
                            }
                        }
                        
                        const derivadaObj = {
                            palabra: palabraText,
                            hanzi: palabraText,
                            pinyin: pinyinDerivada,
                            significado: significadoDerivada || `Relacionado con ${caracter}`,
                            familia: 'derivada',
                            familias: ['derivada'],
                            nivel: nivel,
                            tipo: 'sustantivo',
                            idioma: idioma,
                            frecuencia: 1,
                            neuroScore: 0.5,
                            nivelDominio: 'nuevo',
                            fechaCreacion: Date.now(),
                            esPalabraDerivada: true,
                            caracterRaiz: caracter,
                            desgloseMorfologico: `Contiene el carácter "${caracter}"`,
                            desgloseCaracteres: [
                                { caracter: caracter, pinyin: pinyinDerivada, significado: significadoDerivada }
                            ],
                            asociacionVisual: `🔗 ${palabraText} contiene el carácter ${caracter}`,
                            ejemploFrase: '',
                            traduccionFrase: '',
                            familiaSemanticaPrincipal: 'Caracteres Raíz',
                            temaFamilia: tema.nombre,
                            _version_estandar: versionEstandar
                        };

                        try {
                            const idDer = await db.guardarPalabra(derivadaObj);
                            if (idDer) {
                                palabrasDerivadasGuardadas++;
                                
                                try {
                                    await gestorFavoritos.añadirPalabra(idDer);
                                    await gestorFavoritos.añadirPalabraAGrupo(idDer, `📚 Nivel ${nivel}`);
                                    await gestorFavoritos.añadirPalabraAGrupo(idDer, '🧠 Caracteres Raíz');
                                    await gestorFavoritos.añadirPalabraAGrupo(idDer, `📂 ${tema.nombre}`);
                                } catch (e) {
                                    console.warn(`⚠️ Error guardando derivada en favoritos "${palabraText}":`, e);
                                }
                            }
                        } catch (e) {
                            console.warn(`   ❌ Error guardando derivada "${palabraText}":`, e.message);
                        }
                    }
                }
            }

            // ACTUALIZAR MÓDULOS Y UI
            UITemasActions._actualizarLoading(95, '🔄 Actualizando módulos...', 'Gramática y caracteres');

            if (window.gramatica) {
                await gramatica.cargarPalabras();
                await gramatica.agrupar();
            }

            if (window.pipeline) {
                await pipeline.cargarFrases();
                await pipeline.cargarProgreso();
            }

            if (window.UICaracteres) {
                window.UICaracteres._limpiarCache();
                await window.UICaracteres.recargarVistaActual();
            }

            if (window.UIEspacio) {
                await window.UIEspacio._renderizarMiEspacio();
            }

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(core);
            }

            // GUARDAR MARCA DE SINCRONIZACIÓN
            UITemasActions._actualizarLoading(98, '💾 Guardando estado...', 'Marcando tema como sincronizado');

            const temaActualizado = await db.obtenerTema(temaId);
            if (temaActualizado) {
                temaActualizado._caracteresSincronizados = true;
                temaActualizado._fechaSincronizacion = Date.now();
                temaActualizado._caracteresSincronizadosCount = caracteresImportados;
                temaActualizado._version_estandar = versionEstandar;
                temaActualizado._nombre_version = nombreVersion;
                await db.update('temas', temaActualizado);
                console.log(`✅ Tema "${temaActualizado.nombre}" marcado como sincronizado (${caracteresImportados} caracteres) con ${nombreVersion}`);
            }

            // MOSTRAR RESULTADO
            UITemasActions._actualizarLoading(100, '✅ ¡Sincronización completada!', '');

            await new Promise(r => setTimeout(r, 500));
            UITemasActions._ocultarLoading();

            const mensaje = `✅ Caracteres sincronizados para "${tema.nombre}"\n\n` +
                `🀄 Caracteres procesados: ${caracteresMap.size}\n` +
                `📝 Caracteres raíz creados: ${caracteresImportados}\n` +
                `📖 Palabras derivadas añadidas: ${palabrasDerivadasGuardadas}\n` +
                `📌 Versión: ${nombreVersion}\n` +
                `📅 Última sincronización: ${new Date().toLocaleString()}\n` +
                `✅ Tema marcado como sincronizado`;

            core?.alert(mensaje, '✅ Sincronización Completada');

            await window.UITemas._renderTemas();

        } catch (error) {
            UITemasActions._ocultarLoading();
            console.error('❌ Error sincronizando caracteres:', error);
            core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // MÉTODOS DE CARGA
    // ============================================================

    static _mostrarLoading(mensaje = '⏳ Importando tema...') {
        const existing = document.getElementById('loadingOverlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 100000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            animation: fadeIn 0.3s ease;
            font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        `;
        overlay.innerHTML = `
            <div style="background: var(--white, #ffffff); border-radius: 20px; padding: 40px 35px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.4); animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div style="font-size: 56px; margin-bottom: 16px;">
                    <i class="fas fa-spinner fa-pulse" style="color: var(--primary);"></i>
                </div>
                <h3 style="font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">${mensaje}</h3>
                <p style="font-size: 14px; color: var(--gray); margin-bottom: 16px;" id="loadingStatus">Preparando datos...</p>
                <div style="width: 100%; height: 4px; background: var(--light); border-radius: 2px; overflow: hidden; margin: 0 auto;">
                    <div id="loadingProgress" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 2px; transition: width 0.5s ease;"></div>
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: var(--gray-light);" id="loadingDetail">Inicializando...</div>
            </div>
        `;
        
        if (!document.getElementById('loadingStyles')) {
            const styles = document.createElement('style');
            styles.id = 'loadingStyles';
            styles.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(overlay);
        return overlay;
    }

    static _actualizarLoading(progreso, status, detalle = '') {
        const progressBar = document.getElementById('loadingProgress');
        const statusEl = document.getElementById('loadingStatus');
        const detailEl = document.getElementById('loadingDetail');
        
        if (progressBar) {
            progressBar.style.width = Math.min(100, progreso) + '%';
        }
        if (statusEl && status) {
            statusEl.textContent = status;
        }
        if (detailEl && detalle) {
            detailEl.textContent = detalle;
        }
    }

    static _ocultarLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 300);
        }
    }

    // ============================================================
    // ABRIR CREADOR DE HISTORIA
    // ============================================================

    static async abrirCreadorHistoria(temaId) {
        if (window.UITemas._creandoHistoria) {
            window.UITemas._core?.mostrarToast('⏳ Ya hay una historia en creación', 'warning');
            return;
        }

        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            window.UITemas._core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        window.UITemas._creandoHistoria = true;
        window.UITemas._temaActualParaCrear = temaId;

        const html = `
            <div style="background:var(--white);border-radius:16px;padding:24px;max-width:600px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-size:20px;font-weight:700;color:var(--dark);margin:0;">
                        📝 Crear Historia en "${tema.nombre}"
                    </h3>
                    <button onclick="window.UITemasActions.cerrarCreadorHistoria()" style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;">&times;</button>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:14px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        📌 Título de la historia
                    </label>
                    <input type="text" id="historiaTituloInput" placeholder="Ej: Mi viaje a la cafetería" 
                           style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:15px;font-family:var(--font);">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:14px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        📝 Descripción detallada de la historia
                        <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(opcional pero recomendado)</span>
                    </label>
                    <textarea id="historiaDescripcionInput" rows="6" 
                              placeholder="Ej: Todo el trayecto desde salir de casa hasta llegar a la cafetería..."
                              style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);resize:vertical;"></textarea>
                    <div style="font-size:11px;color:var(--gray-light);margin-top:4px;">
                        💡 Cuanto más detallada sea la descripción, mejor será la historia generada.
                    </div>
                </div>

                <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="window.UITemasActions.generarHistoriaConDescripcion(${temaId})" 
                            style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-magic"></i> Generar con IA
                    </button>
                    <button class="btn-secondary" onclick="window.UITemasActions.cerrarCreadorHistoria()" 
                            style="padding:12px 20px;font-size:15px;background:var(--light);color:var(--gray);border:none;border-radius:8px;cursor:pointer;">
                        Cancelar
                    </button>
                </div>

                <div id="creadorHistoriaResultado" style="margin-top:12px;display:none;padding:12px;border-radius:8px;font-size:14px;"></div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.id = 'creadorHistoriaOverlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
            z-index:100000;display:flex;justify-content:center;align-items:center;
            padding:20px;animation:fadeIn 0.3s ease;
        `;
        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        setTimeout(() => {
            const input = document.getElementById('historiaTituloInput');
            if (input) input.focus();
        }, 100);
    }

    static cerrarCreadorHistoria() {
        const overlay = document.getElementById('creadorHistoriaOverlay');
        if (overlay) overlay.remove();
        window.UITemas._creandoHistoria = false;
        window.UITemas._temaActualParaCrear = null;
    }

    static async generarHistoriaConDescripcion(temaId) {
        const core = window.UITemas._core;
        const tituloInput = document.getElementById('historiaTituloInput');
        const descripcionInput = document.getElementById('historiaDescripcionInput');
        const resultadoDiv = document.getElementById('creadorHistoriaResultado');

        if (!tituloInput || !descripcionInput) return;

        const titulo = tituloInput.value.trim() || 'Historia sin título';
        const descripcion = descripcionInput.value.trim();

        if (!descripcion) {
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
            resultadoDiv.style.border = '1px solid var(--danger)';
            resultadoDiv.innerHTML = '❌ Por favor, escribe una descripción de la historia.';
            return;
        }

        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const nivel = tema.nivel || 'A1';
        const nombreIdioma = window.UITemas._getNombreIdioma(idiomaActivo);
        const esJeroglifico = window.UITemas._esJeroglifico(idiomaActivo);
        const idiomaNativo = window.UITemas._obtenerIdiomaNativo();
        const nombreNativo = window.UITemas._getNombreIdioma(idiomaNativo);

        resultadoDiv.style.display = 'block';
        resultadoDiv.style.background = 'var(--bg)';
        resultadoDiv.style.border = '1px solid var(--light)';
        resultadoDiv.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i>
                <div>
                    <div style="font-weight:600;">Generando plantilla de historia...</div>
                    <div style="font-size:12px;color:var(--gray-light);">${titulo} · ${nombreIdioma} (${nivel})</div>
                </div>
            </div>
        `;

        const btnGenerar = resultadoDiv.parentElement.querySelector('.btn-primary');
        if (btnGenerar) btnGenerar.disabled = true;

        try {
            let instruccionesTranscripcion = '';
            if (esJeroglifico) {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA IDIOMAS JEROGLÍFICOS:
                    - Incluye 'pinyin' CON TONOS para CADA frase y CADA palabra.
                    - La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente.
                `;
            } else {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA TRANSCRIPCIÓN FONÉTICA:
                    - Incluye 'transcripcion' para CADA frase y CADA palabra en ${nombreNativo}.
                    - Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).
                `;
            }

            const plantilla = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "22.0",
                    "accion": "Genera una historia corta sobre el tema indicado",
                    "idioma_objetivo": idiomaActivo,
                    "nombre_idioma": nombreIdioma,
                    "nivel": nivel,
                    "tema": tema.nombre,
                    "num_historias": 1,
                    "max_historias": 1,
                    "max_frases_por_historia": 8,
                    "es_jeroglifico": esJeroglifico,
                    "idioma_nativo": idiomaNativo,
                    "nombre_nativo": nombreNativo,
                    "instrucciones": [
                        "Genera UNA historia basada en esta descripcion:",
                        descripcion,
                        "La historia debe tener entre 6 y 8 frases.",
                        "Cada frase debe tener: 'original', 'traduccion'",
                        "Incluye 'regla_gramatical' y 'explicacion_gramatical' para cada frase",
                        "Incluye 'palabras' con 'familia' y 'significado'",
                        esJeroglifico ? "Incluye 'pinyin' con tonos para cada frase y cada palabra" : 
                        `Incluye 'transcripcion' para cada frase y cada palabra en ${nombreNativo}`,
                        esJeroglifico ? "Incluye una sección 'caracteres_destacados' con los caracteres clave" : "",
                        "Devuelve SOLO un JSON valido con la estructura indicada."
                    ],
                    "formato_palabras": esJeroglifico ? {
                        "hanzi": "El caracter en el idioma objetivo",
                        "pinyin": "Pronunciacion con tonos",
                        "familia": "Familia SEMANTICA",
                        "tipo": "Categoria GRAMATICAL",
                        "significado": "Traduccion al " + idiomaNativo
                    } : {
                        "palabra": "La palabra en el idioma objetivo",
                        "transcripcion": "Transcripción fonética en " + nombreNativo,
                        "familia": "Familia SEMANTICA",
                        "tipo": "Categoria GRAMATICAL",
                        "significado": "Traduccion al " + idiomaNativo
                    }
                },
                "meta": {
                    "tema": tema.nombre,
                    "num_historias": 1,
                    "idioma": idiomaActivo,
                    "nombre_idioma": nombreIdioma,
                    "es_jeroglifico": esJeroglifico,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "nombre_nativo": nombreNativo,
                    "descripcion": descripcion,
                    "fecha_generacion": new Date().toISOString(),
                    "version": "22.0"
                },
                "historias": [
                    {
                        "id": 1,
                        "titulo": titulo,
                        "frases": []
                    }
                ]
            };

            for (let j = 1; j <= 6; j++) {
                const frase = {
                    original: "[Frase " + j + " en " + idiomaActivo + "]",
                    traduccion: "[Traduccion " + j + " al " + idiomaNativo + "]",
                    regla_gramatical: "[Regla gramatical " + j + "]",
                    explicacion_gramatical: "[Explicacion " + j + " en " + idiomaNativo + "]",
                    palabras: []
                };
                
                if (esJeroglifico) {
                    frase.pinyin = "[pinyin_frase_" + j + "]";
                    frase.segmentacion = {
                        hanzi: "[hanzi_frase_" + j + "]",
                        pinyin: "[pinyin_frase_" + j + "]"
                    };
                    frase.palabras.push({
                        hanzi: "[hanzi_palabra" + j + "]",
                        pinyin: "[pinyin_palabra" + j + "]",
                        familia: "sustantivo",
                        tipo: "sustantivo",
                        significado: "[significado_en_" + idiomaNativo + "]"
                    });
                } else {
                    frase.transcripcion = "[transcripcion_en_" + nombreNativo + "_frase_" + j + "]";
                    frase.palabras.push({
                        palabra: "[palabra_" + j + "]",
                        transcripcion: "[transcripcion_en_" + nombreNativo + "_palabra_" + j + "]",
                        familia: "sustantivo",
                        tipo: "sustantivo",
                        significado: "[significado_en_" + idiomaNativo + "]"
                    });
                }
                plantilla.historias[0].frases.push(frase);
            }

            if (esJeroglifico) {
                plantilla.caracteres_destacados = {
                    lista: [
                        {
                            caracter: "[caracter_clave_1]",
                            pinyin: "[pinyin_caracter_1]",
                            significado: "[significado_caracter_1_en_" + idiomaNativo + "]",
                            frecuencia: 0,
                            palabras_relacionadas: [],
                            palabras_relacionadas_info: []
                        }
                    ]
                };
            }

            if (core) {
                core.abrirModal('📄 Generar Historia con IA');
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
                        if (jsonText) {
                            try {
                                const data = JSON.parse(jsonText);
                                if (data.historias && data.historias.length > 0) {
                                    const resultado = await window.UITemasActions.importarTemaCompletoConLoading(
                                        data, 
                                        temaId, 
                                        tema.nombre
                                    );
                                    core.cerrarModal();
                                    window.UITemasActions.cerrarCreadorHistoria();
                                    window.UITemas._verTemaDetalle(temaId);
                                    core.mostrarToast('✅ Historia importada correctamente', 'success');
                                }
                            } catch (e) {
                                core.mostrarToast('❌ Error al importar: ' + e.message, 'error');
                            }
                        }
                    };
                }

                const mensajeExtra = esJeroglifico ? 
                    '⚠️ IMPORTANTE: El JSON incluye campos para PINYIN con tonos.' : 
                    `🎤 IMPORTANTE: El JSON incluye campos para TRANSCRIPCIÓN FONÉTICA en ${nombreNativo}.`;
                
                core.mostrarToast('📄 Plantilla generada. Pide a la IA que la complete y luego importa.', 'info');
                core.mostrarToast(mensajeExtra, 'warning');

                resultadoDiv.style.background = 'rgba(0,184,148,0.1)';
                resultadoDiv.style.border = '1px solid var(--success)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:start;gap:12px;">
                        <span style="font-size:28px;">✅</span>
                        <div>
                            <div style="font-weight:700;font-size:16px;">Plantilla generada</div>
                            <div style="font-size:13px;color:var(--gray);margin-top:4px;">
                                📄 La plantilla JSON está lista en el modal.
                                <br>💡 Pide a la IA que la complete y pulsa "Importar".
                                <br>🀄 Los caracteres se sincronizarán automáticamente.
                                <br>🎤 La transcripción fonética está incluida.
                            </div>
                            <button onclick="window.UITemasActions.cerrarCreadorHistoria()" 
                                    style="margin-top:8px;padding:6px 16px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">
                                <i class="fas fa-check"></i> Entendido
                            </button>
                        </div>
                    </div>
                `;
            }

        } catch (error) {
            console.error('❌ Error generando historia:', error);
            resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
            resultadoDiv.style.border = '1px solid var(--danger)';
            resultadoDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:28px;">❌</span>
                    <div>
                        <div style="font-weight:700;">Error</div>
                        <div style="font-size:13px;color:var(--gray);">${error.message || 'Error desconocido'}</div>
                        <button onclick="window.UITemasActions.generarHistoriaConDescripcion(${temaId})" 
                                style="margin-top:6px;padding:4px 14px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                    </div>
                </div>
            `;
        } finally {
            if (btnGenerar) btnGenerar.disabled = false;
        }
    }

    static async abrirGeneradorDesdeTema(temaId, temaNombre) {
        window.UITemas._temaActualParaJSON = { id: temaId, nombre: temaNombre };

        const temaInput = document.getElementById('jsonTemaInput');
        if (temaInput) {
            temaInput.value = temaNombre;
        }

        if (window.UIJSON && typeof window.UIJSON.abrirGeneradorJSON === 'function') {
            window.UIJSON.abrirGeneradorJSON();
            window.UITemas._core?.mostrarToast('📄 Generando JSON para "' + temaNombre + '"...', 'info');
        } else {
            window.UITemas._core?.mostrarToast('❌ Generador JSON no disponible', 'error');
        }
    }

    static async importarHistoriaATema(temaId) {
        const core = window.UITemas._core;
        if (!temaId) {
            core?.mostrarToast('❌ Tema no especificado', 'error');
            return;
        }

        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        let importArea = document.getElementById('jsonImportArea');
        if (!importArea) {
            const container = window.UITemas._getContainer();
            if (!container) return;

            const areaHTML = `
                <div id="tempImportArea" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:12px;border:2px dashed var(--primary);">
                    <p style="font-size:13px;font-weight:600;margin-bottom:8px;">📥 Importar historia a "${tema.nombre}"</p>
                    <textarea id="jsonImportArea" rows="10" placeholder="Pega aquí el JSON de la historia (incluye pinyin si es jeroglífico)..." style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:13px;font-family:monospace;resize:vertical;"></textarea>
                    <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
                        <button class="btn-success" onclick="window.UITemasActions.importarHistoriaYAsignarATema(${temaId})" style="padding:8px 20px;background:#00B894;color:white;border:none;border-radius:8px;cursor:pointer;">
                            <i class="fas fa-file-import"></i> Importar y Asignar
                        </button>
                        <button class="btn-secondary" onclick="window.UITemasActions.abrirGeneradorDesdeTema(${temaId}, '${tema.nombre.replace(/'/g, "\\'")}')" style="padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;">
                            <i class="fas fa-magic"></i> Generar con IA
                        </button>
                        <button class="btn-secondary" onclick="document.getElementById('tempImportArea').remove()" style="padding:8px 20px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;">
                            Cancelar
                        </button>
                    </div>
                    <div style="font-size:11px;color:var(--gray-light);margin-top:8px;">
                        💡 El JSON debe contener un array "historias" con las historias a importar.
                        <br>📚 Puedes importar múltiples historias a la vez.
                        <br>🧠 Usa "Generar con IA" para crear contenido nuevo.
                        <br>🀄 Los caracteres se sincronizarán automáticamente.
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('afterend', areaHTML);
            importArea = document.getElementById('jsonImportArea');
        }

        if (importArea) {
            importArea.focus();
        }

        core?.mostrarToast('📥 Pega el JSON de las historias o usa "Generar con IA"', 'info');
    }

    static async importarHistoriaYAsignarATema(temaId) {
        const core = window.UITemas._core;
        if (window.UITemas._importando) {
            core?.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }

        const importArea = document.getElementById('jsonImportArea');
        if (!importArea) {
            core?.mostrarToast('❌ No hay JSON para importar', 'error');
            return;
        }

        const jsonText = importArea.value.trim();
        if (!jsonText) {
            core?.mostrarToast('❌ Pega el JSON de la historia primero', 'error');
            return;
        }

        window.UITemas._importando = true;

        try {
            const data = JSON.parse(jsonText);

            if (!data.historias || !Array.isArray(data.historias) || data.historias.length === 0) {
                core?.mostrarToast('❌ JSON inválido: debe contener "historias"', 'error');
                window.UITemas._importando = false;
                return;
            }

            const tema = await db.obtenerTema(temaId);
            const temaNombre = tema?.nombre || 'Tema importado';

            const resultado = await window.UITemasActions.importarTemaCompletoConLoading(data, temaId, temaNombre);

            const tempArea = document.getElementById('tempImportArea');
            if (tempArea) tempArea.remove();

            core?.mostrarToast(`✅ ${resultado.historias} historias importadas`, 'success');
            window.UITemas._verTemaDetalle(temaId);

        } catch (error) {
            console.error('❌ Error importando historia:', error);
            core?.mostrarToast('❌ Error en el JSON: ' + error.message, 'error');
        } finally {
            window.UITemas._importando = false;
        }
    }
}

// ============================================================
// EXPORTAR PARA USO GLOBAL
// ============================================================

window.UITemasActions = UITemasActions;
console.log('✅ UITemas Actions v2.10 - INDEPENDIENTE POR IDIOMA');