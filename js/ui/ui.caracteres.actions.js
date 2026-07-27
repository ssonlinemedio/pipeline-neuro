// ============================================================
// UI CARACTERES ACTIONS v1.6 - CORREGIDO: ERROR EN FAVORITOS
// ============================================================

class UICaracteresActions {
    // ============================================================
    // SELECCIONAR FAMILIA
    // ============================================================

    static async seleccionarFamilia(familiaId, uiCaracteres) {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const familia = familias.find(f => f.caracterRaiz.id === familiaId);

        if (familia) {
            uiCaracteres._familiaSeleccionada = familia;
            uiCaracteres._vistaActual = 'estudio';
            uiCaracteres._modoEstudio = 'flashcard';
            uiCaracteres._ordenTrazosSeleccionado = [];
            await uiCaracteres._renderizarModulo();
        }
    }

    // ============================================================
    // SELECCIONAR PALABRA DERIVADA
    // ============================================================

    static async seleccionarPalabraDerivada(palabraId, uiCaracteres) {
        const palabra = await db.get('palabras', palabraId);
        if (palabra) {
            if (palabra.ejemploFrase) {
                const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
                const frases = await db.obtenerFrasesPorIdioma(idioma);
                const fraseEncontrada = frases.find(f => f.original === palabra.ejemploFrase);
                if (fraseEncontrada) {
                    uiCaracteres._cacheFrasesEjemplo[palabra.ejemploFrase] = fraseEncontrada.traduccion || '';
                }
            }
            uiCaracteres._caracterSeleccionado = palabra;
            uiCaracteres._vistaActual = 'detalle';
            await uiCaracteres._renderizarModulo();
        }
    }

    // ============================================================
    // GENERAR ESTUDIO COMPLETO
    // ============================================================

    static async generarEstudioCompleto(caracterId, uiCaracteres) {
        if (uiCaracteres._generando) return;
        uiCaracteres._generando = true;

        const core = uiCaracteres._getCore();
        if (!core) return;

        const caracter = await db.get('palabras', caracterId);
        if (!caracter || !caracter.esCaracterRaiz) {
            core.mostrarToast('❌ Carácter no encontrado', 'error');
            uiCaracteres._generando = false;
            return;
        }

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivelUsuario = uiCaracteres._obtenerNivelRealUsuario();
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        core.mostrarToast(`🧠 Generando estudio completo para "${caracter.palabra}"...`, 'info');

        try {
            const plantilla = uiCaracteres._generarPlantillaEstudioCompleto(caracter, idioma, nivelUsuario, idiomaNativo, nombreIdioma);

            core.abrirModal(`📄 Estudio completo: ${caracter.palabra}`);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.value = JSON.stringify(plantilla, null, 2);
                textarea.readOnly = false;
                textarea.style.minHeight = '500px';
                textarea.style.fontSize = '12px';
                
                const infoDiv = document.createElement('div');
                infoDiv.style.cssText = `
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    font-size: 13px;
                    color: var(--gray);
                    border-left: 4px solid var(--primary);
                `;
                infoDiv.innerHTML = `
                    <strong>📋 Instrucciones:</strong><br>
                    1. Copia este JSON y pide a la IA que lo complete con información real del carácter.<br>
                    2. Cuando la IA te devuelva el JSON completado, pégalo aquí y pulsa <strong>"Importar"</strong>.<br>
                    3. El estudio se guardará automáticamente y podrás verlo en "Ver Estudio".
                `;
                const modalBody = document.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.insertBefore(infoDiv, modalBody.firstChild);
                }
            }

            const importBtn = document.getElementById('jsonImport');
            if (importBtn) {
                const newImportBtn = importBtn.cloneNode(true);
                importBtn.parentNode.replaceChild(newImportBtn, importBtn);
                
                newImportBtn.onclick = async function() {
                    const jsonText = document.getElementById('jsonTextarea').value;
                    if (!jsonText) {
                        uiCaracteres._core?.mostrarToast('❌ No hay JSON para importar', 'error');
                        return;
                    }
                    
                    try {
                        const data = JSON.parse(jsonText);
                        console.log('📥 JSON parseado correctamente');
                        console.log('📊 Secciones:', Object.keys(data));
                        
                        if (!data.estudio_completo) {
                            uiCaracteres._core?.mostrarToast('❌ JSON inválido: falta "estudio_completo"', 'error');
                            return;
                        }
                        
                        await uiCaracteres._importarEstudioCompleto(caracterId, data);
                        uiCaracteres._core.cerrarModal();
                        uiCaracteres._core.mostrarToast('✅ Estudio importado correctamente', 'success');
                        // 🔥 RECARGAR VISTA INMEDIATAMENTE
                        await uiCaracteres.recargarVistaActual();
                    } catch (e) {
                        uiCaracteres._core?.mostrarToast('❌ Error: ' + e.message, 'error');
                        console.error('❌ Error importando:', e);
                    }
                };
            }

            core.mostrarToast(`✅ Plantilla generada para "${caracter.palabra}"`, 'success');

        } catch (error) {
            console.error('❌ Error generando estudio completo:', error);
            core.mostrarToast('❌ Error: ' + error.message, 'error');
        }

        uiCaracteres._generando = false;
    }

    // ============================================================
    // 🔥 IMPORTAR ESTUDIO COMPLETO - CORREGIDO (ERROR FAVORITOS)
    // ============================================================

    static async importarEstudioCompleto(caracterId, data, uiCaracteres) {
        if (!data || !data.estudio_completo) {
            throw new Error('JSON inválido: falta "estudio_completo"');
        }

        const core = uiCaracteres._getCore();
        const idioma = data.meta?.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const estudio = data.estudio_completo;
        const caracter = await db.get('palabras', caracterId);

        if (!caracter) {
            throw new Error('Carácter no encontrado');
        }

        console.log('📚 Importando estudio completo para:', caracter.palabra);
        console.log('📊 Secciones del estudio:', Object.keys(estudio));

        // ============================================================
        // 1. GUARDAR EL ESTUDIO COMPLETO COMO JSON EN EL CARÁCTER
        // ============================================================
        const estudioJSON = JSON.stringify(estudio);
        
        // ============================================================
        // 2. ACTUALIZAR EL CARÁCTER CON TODA LA INFORMACIÓN
        // ============================================================
        const updates = {
            _estudio_completo: estudioJSON,
            _estudio_completo_data: estudio,
            significado: estudio.significado || caracter.significado,
            pinyin: estudio.pinyin || caracter.pinyin,
        };

        if (estudio.evolucion_historica) {
            updates.etimologia_breve = estudio.evolucion_historica.evolucion || 
                                       estudio.evolucion_historica.significado_original || '';
            updates.evolucion_historica = estudio.evolucion_historica;
        }

        if (estudio.mnemotecnia_avanzada) {
            updates.mnemotecnia = estudio.mnemotecnia_avanzada;
        }

        if (estudio.componentes) {
            updates.componentes = estudio.componentes;
            if (!updates.estructura) updates.estructura = {};
            if (estudio.componentes.radical) {
                updates.estructura.radicales = [estudio.componentes.radical];
            }
            if (estudio.componentes.partes && Array.isArray(estudio.componentes.partes)) {
                updates.estructura.radicales = [...(updates.estructura.radicales || []), ...estudio.componentes.partes];
            }
            if (estudio.componentes.explicacion) {
                updates.estructura.explicacion = estudio.componentes.explicacion;
            }
        }

        if (estudio.variantes) {
            updates.variantes = estudio.variantes;
        }

        if (estudio.usos_modernos) {
            updates.usos_modernos = estudio.usos_modernos;
        }

        if (estudio.conexiones_culturales) {
            updates.conexiones_culturales = estudio.conexiones_culturales;
        }

        if (estudio.simbologia) {
            updates.simbologia = estudio.simbologia;
        }

        if (estudio.caracteres_similares) {
            updates.caracteres_similares = estudio.caracteres_similares;
        }

        if (estudio.errores_comunes) {
            updates.errores_comunes = estudio.errores_comunes;
        }

        if (estudio.srs_sugerencias) {
            updates.srs_sugerencias = estudio.srs_sugerencias;
        }

        if (estudio.ejercicios) {
            updates.ejercicios = estudio.ejercicios;
        }

        if (estudio.logros) {
            updates.logros = estudio.logros;
        }

        if (estudio.frases_ejemplo && Array.isArray(estudio.frases_ejemplo)) {
            updates.frases_ejemplo = estudio.frases_ejemplo;
        }

        // ACTUALIZAR EL CARÁCTER
        const caracterActualizado = { ...caracter, ...updates };
        await db.guardarPalabra(caracterActualizado);
        console.log('✅ Carácter actualizado con estudio completo:', Object.keys(updates));

        // Guardar en caché
        uiCaracteres._cacheEstudiosCompletos[caracterId] = estudio;

        // ============================================================
        // 3. IMPORTAR PALABRAS DERIVADAS DEL ESTUDIO
        // ============================================================
        let totalImportadas = 0;
        let totalDuplicados = 0;
        let totalErrores = 0;
        const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);

        // Inicializar gestorFavoritos si no está listo
        if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
            await window.gestorFavoritos.init();
        }

        if (estudio.palabras_por_nivel) {
            for (const [nivel, palabras] of Object.entries(estudio.palabras_por_nivel)) {
                if (!Array.isArray(palabras)) continue;

                for (const p of palabras) {
                    const texto = p.palabra || '';
                    if (!texto || texto === caracter.palabra) continue;

                    // Verificar si ya existe
                    const existente = palabrasExistentes.find(w =>
                        (w.palabra || w.hanzi || '') === texto &&
                        w.esPalabraDerivada &&
                        w.caracterRaiz === caracter.palabra
                    );

                    if (existente) {
                        totalDuplicados++;
                        continue;
                    }

                    // Crear objeto de palabra derivada
                    const derivadaObj = {
                        palabra: texto,
                        hanzi: texto,
                        pinyin: p.pinyin || '',
                        significado: p.significado || texto,
                        familia: p.familia || 'derivada',
                        familias: [p.familia || 'derivada'],
                        familiaSemantica: p.familia || 'General',
                        nivel: nivel,
                        tipo: 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esPalabraDerivada: true,
                        caracterRaiz: caracter.palabra,
                        desgloseMorfologico: p.desglose_morfologico || `Contiene el carácter "${caracter.palabra}"`,
                        desgloseCaracteres: [
                            { caracter: caracter.palabra, pinyin: caracter.pinyin || '', significado: caracter.significado || '' }
                        ],
                        asociacionVisual: p.asociacion_visual || `🔗 ${texto} contiene el carácter ${caracter.palabra}`,
                        ejemploFrase: p.ejemplo_frase || '',
                        traduccionFrase: p.traduccion_frase || '',
                        familiaSemanticaPrincipal: p.familia || 'General',
                        temaFamilia: 'General',
                        _generadaPorIA: true
                    };

                    try {
                        // 🔥 GUARDAR LA PALABRA PRIMERO
                        const id = await db.guardarPalabra(derivadaObj);
                        
                        if (id) {
                            totalImportadas++;
                            
                            // 🔥 AHORA SÍ AÑADIR A FAVORITOS CON EL ID CORRECTO
                            try {
                                await gestorFavoritos.añadirPalabra(id);
                                await gestorFavoritos.añadirPalabraAGrupo(id, `📚 Nivel ${nivel}`);
                                await gestorFavoritos.añadirPalabraAGrupo(id, `🧠 ${p.familia || 'General'}`);
                            } catch (favError) {
                                console.warn(`⚠️ Error guardando en favoritos "${texto}":`, favError);
                            }

                            if (p.ejemplo_frase && p.traduccion_frase) {
                                uiCaracteres._cacheFrasesEjemplo[p.ejemplo_frase] = p.traduccion_frase;
                            }
                        } else {
                            totalErrores++;
                        }
                    } catch (e) {
                        console.warn(`⚠️ Error importando "${texto}":`, e);
                        totalErrores++;
                    }
                }
            }
        }

        // ============================================================
        // 4. GUARDAR FRASES DE EJEMPLO
        // ============================================================
        let frasesEjemploImportadas = 0;
        if (estudio.frases_ejemplo && Array.isArray(estudio.frases_ejemplo)) {
            const frasesExistentesDB = await db.obtenerFrasesPorIdioma(idioma);
            
            for (const f of estudio.frases_ejemplo) {
                if (!f.frase || !f.traduccion) continue;
                
                const existe = frasesExistentesDB.some(ef => 
                    ef.original === f.frase && ef.idioma === idioma
                );
                
                if (existe) continue;
                
                const fraseObj = {
                    original: f.frase,
                    traduccion: f.traduccion,
                    idioma: idioma,
                    nivel: f.nivel || 'A1',
                    esJeroglifico: true,
                    pinyinCompleto: f.pinyin || '',
                    familiaSemantica: 'Caracteres Raíz',
                    palabras: [],
                    rg: 0,
                    rcn: 0,
                    activa: true,
                    reglaGramatical: f.regla || null,
                    explicacionGramatical: f.explicacion || null,
                    neuroData: {
                        exposiciones: 0,
                        aciertosConsecutivos: 0,
                        fallosConsecutivos: 0,
                        nivelConfianza: 0.5,
                        ultimaActivacion: Date.now(),
                        consolidacion: 0
                    }
                };
                
                try {
                    await db.guardarFrase(fraseObj);
                    frasesEjemploImportadas++;
                    uiCaracteres._cacheFrasesEjemplo[f.frase] = f.traduccion;
                } catch (e) {
                    console.warn(`⚠️ Error guardando frase de ejemplo:`, e);
                }
            }
        }

        // ============================================================
        // 5. REGISTRAR LOGROS
        // ============================================================
        if (estudio.logros && Array.isArray(estudio.logros)) {
            for (const logro of estudio.logros) {
                if (logro.nombre) {
                    uiCaracteres._logrosDesbloqueados.add(logro.nombre);
                }
            }
            await uiCaracteres._guardarLogros();
        }

        // ============================================================
        // 6. GUARDAR EJERCICIOS
        // ============================================================
        if (estudio.ejercicios && Array.isArray(estudio.ejercicios)) {
            const caracterActual = await db.get('palabras', caracterId);
            if (caracterActual) {
                caracterActual.ejercicios = estudio.ejercicios;
                await db.guardarPalabra(caracterActual);
            }
        }

        // ============================================================
        // 7. ACTUALIZAR MÓDULOS
        // ============================================================
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

        // ============================================================
        // 8. MOSTRAR RESUMEN
        // ============================================================
        const mensaje = `✅ Estudio completo importado para "${caracter.palabra}"\n\n` +
            `📝 Palabras importadas: ${totalImportadas}\n` +
            `⏭️ Duplicados omitidos: ${totalDuplicados}\n` +
            `❌ Errores: ${totalErrores}\n` +
            `📖 Frases de ejemplo: ${frasesEjemploImportadas}\n` +
            `🏆 Logros desbloqueados: ${estudio.logros?.length || 0}\n` +
            `📋 Ejercicios: ${estudio.ejercicios?.length || 0}\n\n` +
            `📚 Secciones importadas:\n` +
            `  • Evolución histórica ✅\n` +
            `  • Componentes y radicales ✅\n` +
            `  • Variantes ✅\n` +
            `  • Usos modernos ✅\n` +
            `  • Conexiones culturales ✅\n` +
            `  • Simbología ✅\n` +
            `  • Caracteres similares ✅\n` +
            `  • Errores comunes ✅\n` +
            `  • Sugerencias SRS ✅\n` +
            `  • Ejercicios ✅\n` +
            `  • Logros ✅\n\n` +
            `💡 Haz clic en "Ver Estudio" en la tarjeta para ver todo el contenido.`;

        core?.alert(mensaje, '✅ Importación completada');

        uiCaracteres._limpiarCache();
        await uiCaracteres._renderizarModulo();

        if (window.UIDashboard) {
            window.UIDashboard._cargarDashboardInicial(core);
        }
        if (window.UIEspacio) {
            window.UIEspacio._renderizarMiEspacio();
        }

        return { 
            totalImportadas, 
            totalDuplicados, 
            totalErrores, 
            frasesEjemploImportadas 
        };
    }

    // ============================================================
    // EXPORTAR ESTUDIO
    // ============================================================

    static async exportarEstudio(caracterId, uiCaracteres) {
        const core = uiCaracteres._getCore();
        const caracter = await db.get('palabras', caracterId);

        if (!caracter) {
            core?.mostrarToast('❌ Carácter no encontrado', 'error');
            return;
        }

        let estudio = uiCaracteres._cacheEstudiosCompletos[caracterId];
        if (!estudio) {
            estudio = await uiCaracteres._obtenerEstudioCompleto(caracterId, gestorIdiomas?.getIdiomaActivo() || 'es');
        }

        const data = {
            meta: {
                caracter: caracter.palabra,
                idioma: gestorIdiomas?.getIdiomaActivo() || 'es',
                nivel: caracter.nivel || uiCaracteres._obtenerNivelRealUsuario(),
                fecha_exportacion: new Date().toISOString(),
                version: '2.0'
            },
            estudio_completo: estudio || {}
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estudio_${caracter.palabra}_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        core?.mostrarToast(`✅ Estudio de "${caracter.palabra}" exportado`, 'success');
    }

    // ============================================================
    // OBTENER ESTUDIO COMPLETO
    // ============================================================

    static async obtenerEstudioCompleto(caracterId, idioma, uiCaracteres) {
        if (uiCaracteres._cacheEstudiosCompletos[caracterId]) {
            return uiCaracteres._cacheEstudiosCompletos[caracterId];
        }

        const caracter = await db.get('palabras', caracterId);
        if (!caracter) return null;

        if (caracter._estudio_completo) {
            try {
                const estudio = JSON.parse(caracter._estudio_completo);
                uiCaracteres._cacheEstudiosCompletos[caracterId] = estudio;
                return estudio;
            } catch (e) {
                console.warn('⚠️ Error parseando _estudio_completo:', e);
            }
        }

        if (caracter._estudio_completo_data) {
            uiCaracteres._cacheEstudiosCompletos[caracterId] = caracter._estudio_completo_data;
            return caracter._estudio_completo_data;
        }

        const estudio = {
            caracter_raiz: caracter.palabra,
            pinyin: caracter.pinyin || '',
            significado: caracter.significado || '',
            mnemotecnia_avanzada: caracter.mnemotecnia || '',
            evolucion_historica: caracter.evolucion_historica || null,
            componentes: caracter.componentes || null,
            variantes: caracter.variantes || null,
            usos_modernos: caracter.usos_modernos || null,
            conexiones_culturales: caracter.conexiones_culturales || null,
            simbologia: caracter.simbologia || null,
            caracteres_similares: caracter.caracteres_similares || [],
            errores_comunes: caracter.errores_comunes || [],
            srs_sugerencias: caracter.srs_sugerencias || null,
            ejercicios: caracter.ejercicios || [],
            logros: caracter.logros || [],
            frases_ejemplo: caracter.frases_ejemplo || []
        };

        uiCaracteres._cacheEstudiosCompletos[caracterId] = estudio;
        return estudio;
    }

    // ============================================================
    // ESTUDIAR FAMILIA
    // ============================================================

    static async estudiarFamilia(caracterId, uiCaracteres) {
        const core = uiCaracteres._getCore();
        const caracter = await db.get('palabras', caracterId);

        if (!caracter || !caracter.esCaracterRaiz) {
            core?.mostrarToast('❌ Carácter no encontrado', 'error');
            return;
        }

        uiCaracteres._vistaActual = 'estudio';
        const familias = await db.obtenerFamiliasCaracteres(gestorIdiomas?.getIdiomaActivo() || 'es');
        const familia = familias.find(f => f.caracterRaiz.id === caracterId);

        if (familia) {
            uiCaracteres._familiaSeleccionada = familia;
            uiCaracteres._modoEstudio = 'flashcard';
            await uiCaracteres._renderizarModulo();
            core?.mostrarToast(`📖 Estudiando "${caracter.palabra}"`, 'success');
        } else {
            core?.mostrarToast('❌ Familia no encontrada', 'error');
        }
    }

    // ============================================================
    // ESTUDIAR FAMILIA DE CARACTERES (DESDE DETALLE)
    // ============================================================

    static async estudiarFamiliaCaracteres(caracterId, uiCaracteres) {
        const core = uiCaracteres._getCore();
        const caracter = await db.get('palabras', caracterId);

        if (!caracter || !caracter.esCaracterRaiz) {
            core?.mostrarToast('❌ Carácter no encontrado', 'error');
            return;
        }

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const palabrasDerivadas = todasPalabras.filter(p =>
            p.esPalabraDerivada && p.caracterRaiz === caracter.palabra
        );

        if (palabrasDerivadas.length === 0) {
            core?.mostrarToast('❌ No hay palabras derivadas para estudiar', 'warning');
            return;
        }

        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const frasesParaEstudiar = [];
        const palabrasList = [caracter.palabra, ...palabrasDerivadas.map(p => p.palabra)];

        for (const f of todasFrases) {
            const textoFrase = (f.original || '').toLowerCase();
            const coincide = palabrasList.some(p => textoFrase.includes(p.toLowerCase()));
            if (coincide && !frasesParaEstudiar.some(ef => ef.id === f.id)) {
                frasesParaEstudiar.push(f);
            }
        }

        const estudio = uiCaracteres._cacheEstudiosCompletos[caracterId];
        if (estudio && estudio.frases_ejemplo) {
            for (const f of estudio.frases_ejemplo) {
                if (f.frase) {
                    const existe = frasesParaEstudiar.some(ef => ef.original === f.frase);
                    if (!existe) {
                        const fraseObj = {
                            id: 'ejemplo_' + Date.now() + '_' + Math.random(),
                            original: f.frase,
                            traduccion: f.traduccion || '',
                            esJeroglifico: true,
                            pinyinCompleto: f.pinyin || '',
                            palabras: []
                        };
                        frasesParaEstudiar.push(fraseObj);
                    }
                }
            }
        }

        if (frasesParaEstudiar.length === 0) {
            core?.mostrarToast('❌ No hay frases con estas palabras', 'error');
            return;
        }

        pipeline.frases = frasesParaEstudiar;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);
        core?.irAModulo('study');
        core?.mostrarToast(`📖 Estudiando ${frasesParaEstudiar.length} frases de la familia "${caracter.palabra}"`, 'success');
    }

    // ============================================================
    // PRÁCTICAR PALABRA DERIVADA
    // ============================================================

    static async practicarPalabraDerivada(palabra, idioma, uiCaracteres) {
        const core = uiCaracteres._getCore();
        if (!core) return;

        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const frasesConPalabra = todasFrases.filter(f => {
            const original = (f.original || '').toLowerCase();
            return original.includes(palabra.toLowerCase());
        });

        if (frasesConPalabra.length === 0) {
            core.mostrarToast(`❌ No hay frases con "${palabra}"`, 'warning');
            return;
        }

        pipeline.frases = frasesConPalabra;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);
        core.irAModulo('study');
        core.mostrarToast(`📖 Estudiando ${frasesConPalabra.length} frases con "${palabra}"`, 'success');
    }

    // ============================================================
    // RESPUESTAS DE EJERCICIOS
    // ============================================================

    static async responderCaracter(tipo, palabraId, uiCaracteres) {
        if (!uiCaracteres._core) return;

        try {
            let progreso = await db.obtenerProgreso(palabraId);
            if (!progreso) {
                progreso = {
                    fraseId: palabraId,
                    fase: 1,
                    rcn: 0,
                    rg: 0,
                    ultimoRepaso: Date.now(),
                    proximoRepaso: Date.now() + 3600000,
                    estado: 'en_curso',
                    repasosExitosos: 0,
                    repasosFallidos: 0,
                    intervaloActual: 3600000,
                    fechaCreacion: Date.now(),
                    idioma: gestorIdiomas?.getIdiomaActivo() || 'es',
                    tipo: 'caracter'
                };
            }

            let cambioRCN = 0;
            switch (tipo) {
                case 'correcto':
                    cambioRCN = 0.8 + Math.random() * 0.2;
                    progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 1;
                    break;
                case 'parcial':
                    cambioRCN = 0.3 + Math.random() * 0.2;
                    progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 0.5;
                    break;
                case 'duda':
                    cambioRCN = -0.1 - Math.random() * 0.1;
                    progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                    break;
                case 'fallo':
                    cambioRCN = -0.3 - Math.random() * 0.1;
                    progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                    break;
                default:
                    return;
            }

            progreso.rcn = Math.max(-1, Math.min(5, (progreso.rcn || 0) + cambioRCN));
            progreso.ultimoRepaso = Date.now();
            progreso.idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            progreso.tipo = 'caracter';

            await db.guardarProgreso(progreso);

            const palabra = await db.get('palabras', palabraId);
            if (palabra) {
                palabra.neuroScore = progreso.rcn;
                await db.guardarPalabra(palabra);
            }

            const mensajes = {
                'correcto': '✅ ¡Excelente! Has reforzado este carácter.',
                'parcial': '🟡 Casi correcto. Sigue practicando.',
                'duda': '🟡 Está bien dudar. Revisa el carácter.',
                'fallo': '❌ Has fallado. Vuelve a intentarlo.'
            };

            uiCaracteres._core.mostrarToast(mensajes[tipo] || 'Respuesta registrada', tipo === 'correcto' ? 'success' : 'warning');

            await uiCaracteres._verificarLogros();

            uiCaracteres._familiaSeleccionada = null;
            await uiCaracteres._cargarFamiliaSeleccionada(palabraId);

        } catch (error) {
            console.error('❌ Error respondiendo carácter:', error);
            uiCaracteres._core.mostrarToast('❌ Error registrando respuesta', 'error');
        }
    }

    // ============================================================
    // EJERCICIOS - VALIDACIONES
    // ============================================================

    static async validarEscrituraCaracter(palabraId, uiCaracteres) {
        const input = document.getElementById('escrituraCaracterInput');
        if (!input) return;

        const respuesta = input.value.trim();
        if (!respuesta) {
            document.getElementById('feedbackEscrituraCaracter').textContent = '✍️ Escribe un carácter para validar.';
            return;
        }

        const palabra = await db.get('palabras', palabraId);
        if (!palabra) {
            document.getElementById('feedbackEscrituraCaracter').textContent = '❌ Palabra no encontrada.';
            return;
        }

        const esCorrecto = respuesta === palabra.palabra;
        const feedback = document.getElementById('feedbackEscrituraCaracter');

        if (esCorrecto) {
            feedback.innerHTML = '✅ ¡Correcto! Has escrito el carácter correctamente.';
            feedback.style.color = 'var(--success)';
            await uiCaracteres._responderCaracter('correcto', palabraId);
        } else {
            feedback.innerHTML = `❌ Incorrecto. El carácter correcto es: <strong>${palabra.palabra}</strong>`;
            feedback.style.color = 'var(--danger)';
            await uiCaracteres._responderCaracter('fallo', palabraId);
        }

        input.value = '';
        setTimeout(() => input.focus(), 200);
    }

    static async validarAsociacion(targetId, selectedId, uiCaracteres) {
        const feedback = document.getElementById('feedbackAsociacion');
        if (!feedback) return;

        const esCorrecto = targetId === selectedId;

        if (esCorrecto) {
            feedback.innerHTML = '✅ ¡Correcto! Has asociado correctamente el carácter con su significado.';
            feedback.style.color = 'var(--success)';
            await uiCaracteres._responderCaracter('correcto', targetId);
        } else {
            feedback.innerHTML = '❌ Incorrecto. Intenta de nuevo.';
            feedback.style.color = 'var(--danger)';
            await uiCaracteres._responderCaracter('fallo', targetId);
        }
    }

    static seleccionarTrazo(element, orden, uiCaracteres) {
        if (element.style.opacity === '0.5') return;

        uiCaracteres._ordenTrazosSeleccionado.push(orden);
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.9)';

        const trazos = element.parentElement.querySelectorAll('.trazo-item');
        const totalTrazos = trazos.length;
        const correctOrder = Array.from(trazos).map(el => parseInt(el.dataset.orden)).sort((a, b) => a - b);

        if (uiCaracteres._ordenTrazosSeleccionado.length === totalTrazos) {
            const esCorrecto = uiCaracteres._ordenTrazosSeleccionado.every((val, idx) => val === correctOrder[idx]);
            const feedback = document.getElementById('feedbackTrazos');

            if (esCorrecto) {
                feedback.innerHTML = '✅ ¡Excelente! Has ordenado los trazos correctamente.';
                feedback.style.color = 'var(--success)';
                uiCaracteres._responderCaracter('correcto', uiCaracteres._familiaSeleccionada?.caracterRaiz?.id);
            } else {
                feedback.innerHTML = '❌ El orden no es correcto. Intenta de nuevo.';
                feedback.style.color = 'var(--danger)';
                uiCaracteres._responderCaracter('fallo', uiCaracteres._familiaSeleccionada?.caracterRaiz?.id);

                setTimeout(() => {
                    trazos.forEach(el => {
                        el.style.opacity = '1';
                        el.style.transform = 'scale(1)';
                    });
                    uiCaracteres._ordenTrazosSeleccionado = [];
                    feedback.innerHTML = '💡 Haz clic en los trazos en el orden correcto.';
                    feedback.style.color = 'var(--gray)';
                }, 1500);
            }
        }
    }

    // ============================================================
    // CARGA DE FAMILIA SELECCIONADA
    // ============================================================

    static async cargarFamiliaSeleccionada(palabraId, uiCaracteres) {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const familia = familias.find(f =>
            f.caracterRaiz.id === palabraId ||
            f.palabrasDerivadas.some(p => p.id === palabraId)
        );

        if (familia) {
            uiCaracteres._familiaSeleccionada = familia;
            await uiCaracteres._renderizarModulo();
        }
    }

    // ============================================================
    // GENERAR FAMILIAS DESDE HISTORIAS
    // ============================================================

    static async generarFamiliasDesdeHistorias(uiCaracteres) {
        if (!uiCaracteres._core) return;

        if (!window.vigiaGramatical || !window.vigiaGramatical.enLinea) {
            uiCaracteres._core.mostrarToast('❌ Vigía Gramatical está offline. Conéctate para generar familias.', 'error');
            return;
        }

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivel = uiCaracteres._obtenerNivelRealUsuario();

        try {
            uiCaracteres._core.mostrarToast('🧠 Vigía Gramatical analizando historias...', 'info');

            const historias = await db.obtenerHistoriasPorIdioma(idioma);

            if (historias.length === 0) {
                uiCaracteres._core.mostrarToast('📚 No hay historias. Genera o importa contenido primero.', 'warning');
                return;
            }

            const resultados = await window.vigiaGramatical.generarFamiliasDesdeHistorias(historias, idioma, nivel);

            if (resultados.length === 0) {
                uiCaracteres._core.mostrarToast('⚠️ No se pudieron generar familias. Intenta con más historias.', 'warning');
                return;
            }

            const generados = resultados.filter(r => r.generado).length;
            const yaExistentes = resultados.filter(r => r.ya_existe).length;

            uiCaracteres._core.mostrarToast(`✅ ${generados} familias generadas · ${yaExistentes} ya existían`, generados > 0 ? 'success' : 'info');

            uiCaracteres._limpiarCache();
            window.dispatchEvent(new CustomEvent('historiasImportadas'));

            await uiCaracteres._renderizarModulo();

        } catch (error) {
            console.error('❌ Error generando familias:', error);
            uiCaracteres._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // MODAL GENERAR DERIVADAS
    // ============================================================

    static async abrirModalGenerarDerivadas(caracterId, caracter, pinyin, significado, uiCaracteres) {
        if (uiCaracteres._modalGeneracionAbierto) return;
        uiCaracteres._modalGeneracionAbierto = true;

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivelUsuario = uiCaracteres._obtenerNivelRealUsuario();
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        const overlay = document.createElement('div');
        overlay.id = 'modalGenerarDerivadas';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);
            z-index:100000;display:flex;justify-content:center;align-items:center;
            padding:20px;animation:fadeIn 0.3s ease;
        `;

        overlay.innerHTML = `
            <div style="background:var(--white,#ffffff);border-radius:20px;padding:28px 24px;max-width:650px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:scaleIn 0.3s ease;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            🧠 Generar derivadas
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            ${nombreIdioma} · <strong>${caracter}</strong> ${pinyin ? `(${pinyin})` : ''}
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">${significado || ''}</span>
                        </p>
                    </div>
                    <button onclick="window.UICaracteres._cerrarModalGenerarDerivadas()" style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;transition:all 0.3s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                        &times;
                    </button>
                </div>

                <div style="margin-bottom:16px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                            <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                                🎯 Nivel objetivo
                            </label>
                            <select id="modalDerivadasNivel" style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);background:var(--white);">
                                ${uiCaracteres.NIVELES.map(n => `<option value="${n}" ${n === nivelUsuario ? 'selected' : ''}>${n}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                                🔢 Número de palabras
                            </label>
                            <select id="modalDerivadasCantidad" style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);background:var(--white);">
                                ${[3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${n === 5 ? 'selected' : ''}>${n} palabras</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div style="background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:16px;border-left:4px solid var(--primary);">
                    <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;">📋 Campos que generará la IA</div>
                    <div style="font-size:13px;color:var(--dark);margin-top:4px;line-height:1.6;">
                        • <strong>Palabra</strong> que contiene el carácter ${caracter}<br>
                        • <strong>Pinyin</strong> con tonos<br>
                        • <strong>Significado</strong> en ${idiomaNativo}<br>
                        • <strong>Frase de ejemplo</strong> en ${nombreIdioma}<br>
                        • <strong>Traducción</strong> de la frase al ${idiomaNativo}<br>
                        • <strong>Familia semántica</strong>
                    </div>
                </div>

                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button id="btnGenerarDerivadas" class="btn-primary" style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;transition:all 0.3s;min-width:140px;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-magic"></i> Generar JSON
                    </button>
                    <button id="btnImportarDerivadas" class="btn-success" style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;transition:all 0.3s;min-width:140px;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-file-import"></i> Importar JSON
                    </button>
                    <button class="btn-secondary" onclick="window.UICaracteres._cerrarModalGenerarDerivadas()" style="padding:12px 20px;font-size:15px;border:none;border-radius:10px;cursor:pointer;background:var(--light);color:var(--gray);transition:all 0.3s;">
                        Cancelar
                    </button>
                </div>

                <div id="modalDerivadasResultado" style="margin-top:16px;display:none;padding:16px;border-radius:10px;font-size:14px;background:var(--bg);border:1px solid var(--light);"></div>

                <div style="margin-top:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <label style="font-size:13px;font-weight:600;color:var(--dark);">
                            📄 JSON
                            <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(pega aquí el JSON completado por la IA)</span>
                        </label>
                        <span style="font-size:10px;color:var(--gray-light);">✏️ Editable</span>
                    </div>
                    <textarea id="modalDerivadasJSON" rows="8" placeholder="Pega aquí el JSON completado por la IA..." style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:12px;font-family:monospace;resize:vertical;min-height:150px;background:var(--white);color:var(--dark);"></textarea>
                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UICaracteres._copiarDerivadasJSON()" style="padding:4px 12px;font-size:11px;">
                            <i class="fas fa-copy"></i> Copiar JSON
                        </button>
                        <button class="btn-secondary" onclick="document.getElementById('modalDerivadasJSON').value=''" style="padding:4px 12px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-eraser"></i> Limpiar
                        </button>
                        <span style="font-size:11px;color:var(--gray-light);">💡 Pega el JSON completado por la IA y pulsa "Importar JSON"</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const btnGenerar = document.getElementById('btnGenerarDerivadas');
        const btnImportar = document.getElementById('btnImportarDerivadas');

        if (btnGenerar) {
            btnGenerar.onclick = () => {
                const nivel = document.getElementById('modalDerivadasNivel')?.value || 'A1';
                const cantidad = parseInt(document.getElementById('modalDerivadasCantidad')?.value || '5');
                uiCaracteres._generarPlantillaDerivadas(caracterId, caracter, pinyin || '', significado || '', nivel, cantidad);
            };
        }

        if (btnImportar) {
            btnImportar.onclick = () => {
                uiCaracteres._importarDerivadasGeneradas(caracterId, caracter);
            };
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) uiCaracteres._cerrarModalGenerarDerivadas();
        });

        const escapeHandler = (e) => {
            if (e.key === 'Escape' && uiCaracteres._modalGeneracionAbierto) {
                uiCaracteres._cerrarModalGenerarDerivadas();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        uiCaracteres._escapeHandlerDerivadas = escapeHandler;
    }

    // ============================================================
    // CERRAR MODAL GENERAR DERIVADAS
    // ============================================================

    static cerrarModalGenerarDerivadas(uiCaracteres) {
        const overlay = document.getElementById('modalGenerarDerivadas');
        if (overlay) overlay.remove();
        uiCaracteres._modalGeneracionAbierto = false;
        if (uiCaracteres._escapeHandlerDerivadas) {
            document.removeEventListener('keydown', uiCaracteres._escapeHandlerDerivadas);
            uiCaracteres._escapeHandlerDerivadas = null;
        }
    }

    // ============================================================
    // GENERAR PLANTILLA DERIVADAS
    // ============================================================

    static async generarPlantillaDerivadas(caracterId, caracter, pinyin, significado, nivel, cantidad, uiCaracteres) {
        if (uiCaracteres._generando) return;
        uiCaracteres._generando = true;

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        const resultadoDiv = document.getElementById('modalDerivadasResultado');
        const jsonArea = document.getElementById('modalDerivadasJSON');

        if (resultadoDiv) {
            resultadoDiv.style.display = 'block';
            resultadoDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i>
                    <div>
                        <div style="font-weight:600;">Generando plantilla...</div>
                        <div style="font-size:12px;color:var(--gray-light);">${cantidad} palabras · Nivel ${nivel}</div>
                    </div>
                </div>
            `;
        }

        try {
            const plantilla = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "2.0",
                    "accion": `Genera ${cantidad} palabras que contengan el carácter "${caracter}" en ${nombreIdioma}`,
                    "caracter_raiz": caracter,
                    "pinyin_raiz": pinyin || "",
                    "significado_raiz": significado || "",
                    "idioma_objetivo": idioma,
                    "nombre_idioma": nombreIdioma,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "num_palabras": cantidad,
                    "instrucciones": [
                        `1. Genera ${cantidad} palabras en ${nombreIdioma} que CONTENGAN el carácter "${caracter}"`,
                        `2. Las palabras deben ser de nivel ${nivel}`,
                        `3. Para cada palabra, proporciona pinyin con tonos`,
                        `4. Traduce el significado al ${idiomaNativo}`,
                        `5. Proporciona una frase de ejemplo en ${nombreIdioma}`,
                        `6. Traduce la frase al ${idiomaNativo}`,
                        `7. Clasifica cada palabra en una familia semántica`,
                        `8. NO incluyas "${caracter}" como palabra derivada`
                    ],
                    "familias_semanticas_disponibles": uiCaracteres.FAMILIAS_SEMANTICAS
                },
                "meta": {
                    "caracter_raiz": caracter,
                    "idioma": idioma,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "num_palabras": cantidad,
                    "fecha_generacion": new Date().toISOString()
                },
                "palabras": []
            };

            for (let i = 1; i <= cantidad; i++) {
                plantilla.palabras.push({
                    "id": i,
                    "palabra": `[palabra_${i}_que_contiene_${caracter}]`,
                    "pinyin": `[pinyin_de_palabra_${i}]`,
                    "significado": `[significado_en_${idiomaNativo}]`,
                    "ejemplo_frase": `[frase_ejemplo_en_${nombreIdioma}]`,
                    "traduccion_frase": `[traduccion_al_${idiomaNativo}]`,
                    "familia_semantica": `[familia_semantica]`,
                    "desglose_morfologico": `[opcional]`
                });
            }

            if (jsonArea) {
                jsonArea.value = JSON.stringify(plantilla, null, 2);
                jsonArea.style.borderColor = 'var(--success)';
                jsonArea.style.background = 'rgba(0,184,148,0.05)';
            }

            if (resultadoDiv) {
                resultadoDiv.style.background = 'rgba(0,184,148,0.1)';
                resultadoDiv.style.border = '1px solid var(--success)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:start;gap:12px;">
                        <span style="font-size:28px;">✅</span>
                        <div>
                            <div style="font-weight:700;font-size:16px;">Plantilla generada</div>
                            <div style="font-size:13px;color:var(--gray);margin-top:4px;">
                                📝 ${cantidad} palabras · Nivel ${nivel}
                            </div>
                            <div style="font-size:12px;color:var(--gray-light);margin-top:2px;">
                                💡 Copia el JSON, pide a la IA que lo complete, y luego pulsa "Importar JSON"
                            </div>
                            <button onclick="window.UICaracteres._copiarDerivadasJSON()" style="margin-top:8px;padding:4px 14px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-family:var(--font);" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-copy"></i> Copiar JSON
                            </button>
                        </div>
                    </div>
                `;
            }

            uiCaracteres._core?.mostrarToast(`✅ Plantilla generada para "${caracter}"`, 'success');

        } catch (error) {
            console.error('❌ Error:', error);
            if (resultadoDiv) {
                resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
                resultadoDiv.style.border = '1px solid var(--danger)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:28px;">❌</span>
                        <div>
                            <div style="font-weight:700;">Error</div>
                            <div style="font-size:13px;color:var(--gray);">${error.message}</div>
                        </div>
                    </div>
                `;
            }
            uiCaracteres._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }

        uiCaracteres._generando = false;
    }

    // ============================================================
    // IMPORTAR DERIVADAS GENERADAS
    // ============================================================

    static async importarDerivadasGeneradas(caracterId, caracter, uiCaracteres) {
        const jsonArea = document.getElementById('modalDerivadasJSON');
        if (!jsonArea) {
            uiCaracteres._core?.mostrarToast('❌ No se encontró el área JSON', 'error');
            return;
        }

        const jsonText = jsonArea.value.trim();

        if (!jsonText || jsonText === 'Genera la plantilla primero...') {
            uiCaracteres._core?.mostrarToast('❌ Genera la plantilla primero o pega un JSON completado', 'error');
            return;
        }

        try {
            const data = JSON.parse(jsonText);

            let palabras = data.palabras;
            let meta = data.meta || data;

            if (!palabras && data.elementos) {
                palabras = data.elementos;
            }

            if (!palabras || !Array.isArray(palabras) || palabras.length === 0) {
                for (const key of Object.keys(data)) {
                    if (data[key] && Array.isArray(data[key]) && data[key].length > 0 && data[key][0].palabra) {
                        palabras = data[key];
                        break;
                    }
                }
            }

            if (!palabras || !Array.isArray(palabras) || palabras.length === 0) {
                uiCaracteres._core?.mostrarToast('❌ JSON inválido: debe tener "palabras" o "elementos"', 'error');
                return;
            }

            const idioma = meta.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = meta.nivel || uiCaracteres._obtenerNivelRealUsuario();

            let pinyinRaiz = '';
            try {
                const palabraRaiz = await db.get('palabras', caracterId);
                if (palabraRaiz && palabraRaiz.pinyin) {
                    pinyinRaiz = palabraRaiz.pinyin;
                }
            } catch (e) {
                console.warn('⚠️ No se pudo obtener pinyin del carácter raíz:', e);
            }

            const palabrasValidas = palabras.filter(p =>
                p.palabra &&
                !p.palabra.startsWith('[') &&
                !p.palabra.includes('palabra_') &&
                p.palabra !== caracter &&
                p.palabra.length > 1
            );

            if (palabrasValidas.length === 0) {
                uiCaracteres._core?.mostrarToast('❌ No hay palabras válidas en el JSON. Completa la plantilla con la IA.', 'error');
                return;
            }

            uiCaracteres._core?.mostrarToast(`🔄 Importando ${palabrasValidas.length} palabras...`, 'info');

            const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
            const existentesSet = new Set(
                palabrasExistentes
                    .filter(p => p.esPalabraDerivada && p.caracterRaiz === caracter)
                    .map(p => p.palabra || p.hanzi || '')
            );

            let importadas = 0;
            let duplicados = 0;
            let errores = 0;

            for (const p of palabrasValidas) {
                const palabraText = p.palabra || '';
                if (!palabraText || palabraText === caracter) {
                    errores++;
                    continue;
                }

                if (existentesSet.has(palabraText)) {
                    duplicados++;
                    continue;
                }

                let pinyinPalabra = p.pinyin || '';
                if (!pinyinPalabra && pinyinRaiz) {
                    pinyinPalabra = pinyinRaiz;
                }

                const derivadaObj = {
                    palabra: palabraText,
                    hanzi: palabraText,
                    pinyin: pinyinPalabra,
                    significado: p.significado || palabraText,
                    familia: 'derivada',
                    familias: ['derivada'],
                    familiaSemantica: p.familia_semantica || 'General',
                    nivel: nivel,
                    tipo: 'sustantivo',
                    idioma: idioma,
                    frecuencia: 1,
                    neuroScore: 0.5,
                    nivelDominio: 'nuevo',
                    fechaCreacion: Date.now(),
                    esPalabraDerivada: true,
                    caracterRaiz: caracter,
                    desgloseMorfologico: p.desglose_morfologico || `Contiene el carácter "${caracter}"`,
                    desgloseCaracteres: [
                        {
                            caracter: caracter,
                            pinyin: pinyinRaiz || '',
                            significado: p.significado || ''
                        }
                    ],
                    asociacionVisual: p.asociacion_visual || `🔗 ${palabraText} contiene el carácter ${caracter}`,
                    ejemploFrase: p.ejemplo_frase || '',
                    traduccionFrase: p.traduccion_frase || '',
                    familiaSemanticaPrincipal: p.familia_semantica || 'General',
                    temaFamilia: 'General',
                    _generadaPorIA: true
                };

                try {
                    const id = await db.guardarPalabra(derivadaObj);
                    if (id) {
                        importadas++;
                        existentesSet.add(palabraText);

                        if (window.gestorFavoritos) {
                            await gestorFavoritos.añadirPalabra(id);
                            await gestorFavoritos.añadirPalabraAGrupo(id, `📚 Nivel ${nivel}`);
                            await gestorFavoritos.añadirPalabraAGrupo(id, `🧠 ${p.familia_semantica || 'General'}`);
                        }

                        if (p.ejemplo_frase && p.traduccion_frase) {
                            uiCaracteres._cacheFrasesEjemplo[p.ejemplo_frase] = p.traduccion_frase;
                        }
                    } else {
                        errores++;
                    }
                } catch (e) {
                    console.warn(`⚠️ Error importando "${palabraText}":`, e);
                    errores++;
                }
            }

            uiCaracteres._cerrarModalGenerarDerivadas();

            const mensaje = `✅ Importación completada\n\n` +
                `📝 Importadas: ${importadas}\n` +
                `⏭️ Duplicadas: ${duplicados}\n` +
                `❌ Errores: ${errores}\n\n` +
                `${importadas > 0 ? '💡 Las nuevas palabras están disponibles en "Mi Espacio" y en el estudio del carácter.' : ''}`;

            uiCaracteres._core?.alert(mensaje, '✅ Completado');

            uiCaracteres._limpiarCache();
            // 🔥 RECARGAR VISTA INMEDIATAMENTE
            await uiCaracteres.recargarVistaActual();

            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(uiCaracteres._core);
            if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();

        } catch (error) {
            console.error('❌ Error importando derivadas:', error);
            uiCaracteres._core?.mostrarToast('❌ Error en el JSON: ' + error.message, 'error');
        }
    }

    // ============================================================
    // COPIAR JSON DERIVADAS
    // ============================================================

    static copiarDerivadasJSON() {
        const jsonArea = document.getElementById('modalDerivadasJSON');
        if (!jsonArea) return;

        navigator.clipboard.writeText(jsonArea.value)
            .then(() => uiCaracteres._core?.mostrarToast('📋 JSON copiado al portapapeles', 'success'))
            .catch(() => {
                jsonArea.select();
                document.execCommand('copy');
                uiCaracteres._core?.mostrarToast('📋 JSON copiado al portapapeles', 'success');
            });
    }

    // ============================================================
    // MODAL - IMPORTACIÓN MASIVA
    // ============================================================

    static async abrirModalImportacionMasiva(uiCaracteres) {
        if (uiCaracteres._modalImportacionMasivaAbierto) return;
        uiCaracteres._modalImportacionMasivaAbierto = true;

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivelUsuario = uiCaracteres._obtenerNivelRealUsuario();
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const caracteresRaiz = familias.map(f => f.caracterRaiz);

        if (caracteresRaiz.length === 0) {
            uiCaracteres._core?.mostrarToast('❌ No hay caracteres raíz', 'error');
            uiCaracteres._modalImportacionMasivaAbierto = false;
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'modalImportacionMasiva';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);
            z-index:100000;display:flex;justify-content:center;align-items:center;
            padding:20px;animation:fadeIn 0.3s ease;
        `;

        overlay.innerHTML = `
            <div style="background:var(--white,#ffffff);border-radius:20px;padding:28px 24px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:scaleIn 0.3s ease;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            📥 Importar derivadas masivas
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            ${nombreIdioma} · ${caracteresRaiz.length} caracteres · Nivel ${nivelUsuario}
                        </p>
                    </div>
                    <button onclick="window.UICaracteres._cerrarModalImportacionMasiva()" style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;transition:all 0.3s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                        &times;
                    </button>
                </div>

                <div style="margin-bottom:16px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                            <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                                🎯 Nivel objetivo
                            </label>
                            <select id="modalMasivoNivel" style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);background:var(--white);">
                                ${uiCaracteres.NIVELES.map(n => `<option value="${n}" ${n === nivelUsuario ? 'selected' : ''}>${n}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                                🔢 Palabras por carácter
                            </label>
                            <select id="modalMasivoCantidad" style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);background:var(--white);">
                                ${[3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${n === 5 ? 'selected' : ''}>${n} palabras</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div style="background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:16px;border-left:4px solid var(--primary);">
                    <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;">📋 Caracteres (${caracteresRaiz.length})</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                        ${caracteresRaiz.slice(0, 15).map(c => `
                            <span style="font-size:14px;background:var(--white);padding:2px 10px;border-radius:8px;border:1px solid var(--light);">
                                ${c.palabra} ${c.pinyin ? `(${c.pinyin})` : ''}
                            </span>
                        `).join('')}
                        ${caracteresRaiz.length > 15 ? `<span style="font-size:12px;color:var(--gray-light);">+${caracteresRaiz.length - 15} más</span>` : ''}
                    </div>
                </div>

                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="window.UICaracteres._generarPlantillaMasiva()" style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;transition:all 0.3s;min-width:140px;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-magic"></i> Generar JSON Masivo
                    </button>
                    <button class="btn-success" onclick="window.UICaracteres._importarDerivadasMasivas()" style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;transition:all 0.3s;min-width:140px;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-file-import"></i> Importar JSON
                    </button>
                    <button class="btn-secondary" onclick="window.UICaracteres._cerrarModalImportacionMasiva()" style="padding:12px 20px;font-size:15px;border:none;border-radius:10px;cursor:pointer;background:var(--light);color:var(--gray);transition:all 0.3s;">
                        Cancelar
                    </button>
                </div>

                <div id="modalMasivoResultado" style="margin-top:16px;display:none;padding:16px;border-radius:10px;font-size:14px;background:var(--bg);border:1px solid var(--light);"></div>

                <div style="margin-top:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        📄 JSON (Pega aquí el JSON completado por la IA)
                        <span style="font-size:11px;font-weight:400;color:var(--success);">✏️ Editable</span>
                    </label>
                    <textarea id="modalMasivoJSON" rows="8" placeholder="Pega aquí el JSON completado por la IA para importar todas las derivadas..." style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:12px;font-family:monospace;resize:vertical;min-height:150px;background:var(--white);color:var(--dark);"></textarea>
                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UICaracteres._copiarMasivoJSON()" style="padding:4px 12px;font-size:11px;">
                            <i class="fas fa-copy"></i> Copiar JSON
                        </button>
                        <button class="btn-secondary" onclick="document.getElementById('modalMasivoJSON').value=''" style="padding:4px 12px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-eraser"></i> Limpiar
                        </button>
                        <span style="font-size:11px;color:var(--gray-light);">💡 Pega el JSON completado por la IA y pulsa "Importar JSON"</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) uiCaracteres._cerrarModalImportacionMasiva();
        });

        const escapeHandler = (e) => {
            if (e.key === 'Escape' && uiCaracteres._modalImportacionMasivaAbierto) {
                uiCaracteres._cerrarModalImportacionMasiva();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        uiCaracteres._escapeHandlerMasivo = escapeHandler;
    }

    // ============================================================
    // CERRAR MODAL IMPORTACIÓN MASIVA
    // ============================================================

    static cerrarModalImportacionMasiva(uiCaracteres) {
        const overlay = document.getElementById('modalImportacionMasiva');
        if (overlay) overlay.remove();
        uiCaracteres._modalImportacionMasivaAbierto = false;
        if (uiCaracteres._escapeHandlerMasivo) {
            document.removeEventListener('keydown', uiCaracteres._escapeHandlerMasivo);
            uiCaracteres._escapeHandlerMasivo = null;
        }
    }

    // ============================================================
    // GENERAR PLANTILLA MASIVA
    // ============================================================

    static async generarPlantillaMasiva(uiCaracteres) {
        if (uiCaracteres._generando) return;
        uiCaracteres._generando = true;

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivel = document.getElementById('modalMasivoNivel')?.value || 'A1';
        const cantidad = parseInt(document.getElementById('modalMasivoCantidad')?.value || '5');
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const caracteresRaiz = familias.map(f => f.caracterRaiz);

        const resultadoDiv = document.getElementById('modalMasivoResultado');
        const jsonArea = document.getElementById('modalMasivoJSON');

        if (resultadoDiv) {
            resultadoDiv.style.display = 'block';
            resultadoDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i>
                    <div>
                        <div style="font-weight:600;">Generando plantilla masiva...</div>
                        <div style="font-size:12px;color:var(--gray-light);">${caracteresRaiz.length} caracteres · ${cantidad} palabras cada uno</div>
                    </div>
                </div>
            `;
        }

        try {
            const plantilla = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "1.0",
                    "accion": `Genera palabras derivadas para TODOS los caracteres raíz en ${idioma}`,
                    "idioma_objetivo": idioma,
                    "nombre_idioma": nombreIdioma,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "num_palabras_por_caracter": cantidad,
                    "total_caracteres": caracteresRaiz.length,
                    "instrucciones": [
                        `1. Para CADA carácter, genera ${cantidad} palabras que lo contengan`,
                        `2. Las palabras deben ser de nivel ${nivel}`,
                        `3. Incluye pinyin, significado, frase de ejemplo y traducción`,
                        `4. NO incluyas el carácter raíz como palabra derivada`
                    ],
                    "familias_semanticas_disponibles": uiCaracteres.FAMILIAS_SEMANTICAS
                },
                "meta": {
                    "idioma": idioma,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "num_palabras_por_caracter": cantidad,
                    "total_caracteres": caracteresRaiz.length,
                    "fecha_generacion": new Date().toISOString()
                },
                "caracteres": []
            };

            for (const c of caracteresRaiz) {
                const palabras = [];
                for (let i = 1; i <= cantidad; i++) {
                    palabras.push({
                        "id": i,
                        "palabra": `[palabra_${i}_que_contiene_${c.palabra}]`,
                        "pinyin": `[pinyin_${i}]`,
                        "significado": `[significado_en_${idiomaNativo}]`,
                        "ejemplo_frase": `[frase_ejemplo_en_${idioma}]`,
                        "traduccion_frase": `[traduccion_al_${idiomaNativo}]`,
                        "familia_semantica": `[familia_semantica]`
                    });
                }
                plantilla.caracteres.push({
                    "caracter_raiz": c.palabra,
                    "pinyin_raiz": c.pinyin || "",
                    "significado_raiz": c.significado || "",
                    "palabras": palabras
                });
            }

            if (jsonArea) {
                jsonArea.value = JSON.stringify(plantilla, null, 2);
                jsonArea.style.borderColor = 'var(--success)';
                jsonArea.style.background = 'rgba(0,184,148,0.05)';
            }

            if (resultadoDiv) {
                resultadoDiv.style.background = 'rgba(0,184,148,0.1)';
                resultadoDiv.style.border = '1px solid var(--success)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:start;gap:12px;">
                        <span style="font-size:28px;">✅</span>
                        <div>
                            <div style="font-weight:700;font-size:16px;">Plantilla masiva generada</div>
                            <div style="font-size:13px;color:var(--gray);margin-top:4px;">
                                📝 ${caracteresRaiz.length} caracteres · ${cantidad} palabras cada uno
                            </div>
                            <button onclick="window.UICaracteres._copiarMasivoJSON()" style="margin-top:8px;padding:4px 14px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-family:var(--font);" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-copy"></i> Copiar JSON
                            </button>
                        </div>
                    </div>
                `;
            }

            uiCaracteres._core?.mostrarToast(`✅ Plantilla masiva generada para ${caracteresRaiz.length} caracteres`, 'success');

        } catch (error) {
            console.error('❌ Error:', error);
            if (resultadoDiv) {
                resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
                resultadoDiv.style.border = '1px solid var(--danger)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:28px;">❌</span>
                        <div>
                            <div style="font-weight:700;">Error</div>
                            <div style="font-size:13px;color:var(--gray);">${error.message}</div>
                        </div>
                    </div>
                `;
            }
            uiCaracteres._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }

        uiCaracteres._generando = false;
    }

    // ============================================================
    // COPIAR JSON MASIVO
    // ============================================================

    static copiarMasivoJSON() {
        const jsonArea = document.getElementById('modalMasivoJSON');
        if (!jsonArea) return;

        navigator.clipboard.writeText(jsonArea.value)
            .then(() => uiCaracteres._core?.mostrarToast('📋 JSON copiado', 'success'))
            .catch(() => {
                jsonArea.select();
                document.execCommand('copy');
                uiCaracteres._core?.mostrarToast('📋 JSON copiado', 'success');
            });
    }

    // ============================================================
    // IMPORTAR DERIVADAS MASIVAS
    // ============================================================

    static async importarDerivadasMasivas(uiCaracteres) {
        if (uiCaracteres._importando) return;

        const jsonArea = document.getElementById('modalMasivoJSON');
        if (!jsonArea) {
            uiCaracteres._core?.mostrarToast('❌ No hay JSON', 'error');
            return;
        }

        const jsonText = jsonArea.value.trim();
        if (!jsonText || jsonText === 'Genera la plantilla primero...') {
            uiCaracteres._core?.mostrarToast('❌ No hay JSON. Genera la plantilla primero o pega un JSON completado.', 'error');
            return;
        }

        uiCaracteres._importando = true;
        uiCaracteres._core?.mostrarToast('🔄 Importando derivadas masivas...', 'info');

        try {
            const data = JSON.parse(jsonText);

            if (!data.meta || !data.caracteres || !Array.isArray(data.caracteres)) {
                uiCaracteres._core?.mostrarToast('❌ JSON inválido: falta "meta" o "caracteres"', 'error');
                uiCaracteres._importando = false;
                return;
            }

            const idioma = data.meta.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = data.meta.nivel || uiCaracteres._obtenerNivelRealUsuario();

            let totalImportadas = 0;
            let totalDuplicados = 0;
            const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);

            for (const c of data.caracteres) {
                const caracterRaiz = c.caracter_raiz;
                if (!caracterRaiz) continue;

                const palabrasValidas = (c.palabras || []).filter(p =>
                    p.palabra &&
                    !p.palabra.startsWith('[') &&
                    p.palabra !== caracterRaiz &&
                    p.palabra.length > 1
                );

                if (palabrasValidas.length === 0) continue;

                const existentesSet = new Set(
                    palabrasExistentes
                        .filter(p => p.esPalabraDerivada && p.caracterRaiz === caracterRaiz)
                        .map(p => p.palabra || p.hanzi || '')
                );

                for (const p of palabrasValidas) {
                    const palabraText = p.palabra || '';
                    if (!palabraText || palabraText === caracterRaiz) continue;

                    if (existentesSet.has(palabraText)) {
                        totalDuplicados++;
                        continue;
                    }

                    const derivadaObj = {
                        palabra: palabraText,
                        hanzi: palabraText,
                        pinyin: p.pinyin || '',
                        significado: p.significado || palabraText,
                        familia: 'derivada',
                        familias: ['derivada'],
                        familiaSemantica: p.familia_semantica || 'General',
                        nivel: nivel,
                        tipo: 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esPalabraDerivada: true,
                        caracterRaiz: caracterRaiz,
                        desgloseMorfologico: `Contiene el carácter "${caracterRaiz}"`,
                        desgloseCaracteres: [
                            { caracter: caracterRaiz, pinyin: '', significado: '' }
                        ],
                        asociacionVisual: `🔗 ${palabraText} contiene el carácter ${caracterRaiz}`,
                        ejemploFrase: p.ejemplo_frase || '',
                        traduccionFrase: p.traduccion_frase || '',
                        familiaSemanticaPrincipal: p.familia_semantica || 'General',
                        temaFamilia: 'General',
                        _generadaPorIA: true
                    };

                    try {
                        const id = await db.guardarPalabra(derivadaObj);
                        if (id) {
                            totalImportadas++;
                            existentesSet.add(palabraText);

                            if (window.gestorFavoritos) {
                                await gestorFavoritos.añadirPalabra(id);
                                await gestorFavoritos.añadirPalabraAGrupo(id, `📚 Nivel ${nivel}`);
                                await gestorFavoritos.añadirPalabraAGrupo(id, `🧠 ${p.familia_semantica || 'General'}`);
                            }

                            if (p.ejemplo_frase && p.traduccion_frase) {
                                uiCaracteres._cacheFrasesEjemplo[p.ejemplo_frase] = p.traduccion_frase;
                            }
                        }
                    } catch (e) {
                        console.warn(`⚠️ Error importando "${palabraText}":`, e);
                    }
                }
            }

            uiCaracteres._cerrarModalImportacionMasiva();

            const mensaje = `✅ Importación masiva completada\n\n📝 Importadas: ${totalImportadas}\n⏭️ Duplicadas: ${totalDuplicados}`;
            uiCaracteres._core?.alert(mensaje, '✅ Completado');

            uiCaracteres._limpiarCache();
            // 🔥 RECARGAR VISTA INMEDIATAMENTE
            await uiCaracteres.recargarVistaActual();

            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(uiCaracteres._core);
            if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();

        } catch (error) {
            console.error('❌ Error importando derivadas masivas:', error);
            uiCaracteres._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }

        uiCaracteres._importando = false;
    }

    // ============================================================
    // MODAL - EXPORTAR ESTUDIOS
    // ============================================================

    static async abrirModalExportarEstudios(uiCaracteres) {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const caracteresRaiz = familias.map(f => f.caracterRaiz);

        if (caracteresRaiz.length === 0) {
            uiCaracteres._core?.mostrarToast('❌ No hay caracteres para exportar', 'error');
            return;
        }

        const core = uiCaracteres._getCore();
        const opciones = caracteresRaiz.map((c, i) =>
            `${i + 1}. ${c.palabra} ${c.pinyin ? `(${c.pinyin})` : ''}`
        ).join('\n');

        const seleccion = await core?.prompt(
            `📤 Exportar estudios de caracteres\n\n` +
            `Selecciona un carácter para exportar su estudio completo:\n\n` +
            opciones + '\n\n' +
            `0. Exportar TODOS los estudios\n` +
            `Escribe el número:`,
            '0',
            '0-' + caracteresRaiz.length,
            '📤 Exportar'
        );

        if (seleccion === null || seleccion === undefined) return;

        const idx = parseInt(seleccion);
        if (isNaN(idx)) {
            core?.mostrarToast('❌ Selección inválida', 'error');
            return;
        }

        if (idx === 0) {
            const data = {
                meta: {
                    idioma: idioma,
                    nivel: uiCaracteres._obtenerNivelRealUsuario(),
                    fecha_exportacion: new Date().toISOString(),
                    version: '2.0',
                    total_caracteres: caracteresRaiz.length
                },
                caracteres: []
            };

            for (const c of caracteresRaiz) {
                const estudio = await uiCaracteres._obtenerEstudioCompleto(c.id, idioma);
                data.caracteres.push({
                    caracter: c.palabra,
                    pinyin: c.pinyin || '',
                    significado: c.significado || '',
                    estudio: estudio || {}
                });
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `estudios_caracteres_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);

            core?.mostrarToast(`✅ ${caracteresRaiz.length} estudios exportados`, 'success');

        } else if (idx >= 1 && idx <= caracteresRaiz.length) {
            const caracter = caracteresRaiz[idx - 1];
            await uiCaracteres._exportarEstudio(caracter.id);
        } else {
            core?.mostrarToast('❌ Selección inválida', 'error');
        }
    }

    // ============================================================
    // SISTEMA DE LOGROS
    // ============================================================

    static async verificarLogros(uiCaracteres) {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const totalFamilias = familias.length;
        let totalDerivadas = 0;
        let caracteresEstudiados = 0;

        for (const f of familias) {
            const count = f.palabrasDerivadas?.length || 0;
            totalDerivadas += count;
            if (count > 0 || (f.caracterRaiz?.neuroScore || 0) > 0) {
                caracteresEstudiados++;
            }
        }

        const racha = await uiCaracteres._calcularRacha();

        let nuevosLogros = [];

        if (totalFamilias >= 1 && !uiCaracteres._logrosDesbloqueados.has('primer_estudio')) {
            uiCaracteres._logrosDesbloqueados.add('primer_estudio');
            nuevosLogros.push('primer_estudio');
        }

        if (caracteresEstudiados >= 3 && !uiCaracteres._logrosDesbloqueados.has('3_estudios')) {
            uiCaracteres._logrosDesbloqueados.add('3_estudios');
            nuevosLogros.push('3_estudios');
        }

        if (caracteresEstudiados >= 10 && !uiCaracteres._logrosDesbloqueados.has('10_estudios')) {
            uiCaracteres._logrosDesbloqueados.add('10_estudios');
            nuevosLogros.push('10_estudios');
        }

        if (totalDerivadas >= 5 && !uiCaracteres._logrosDesbloqueados.has('5_palabras')) {
            uiCaracteres._logrosDesbloqueados.add('5_palabras');
            nuevosLogros.push('5_palabras');
        }

        if (totalDerivadas >= 20 && !uiCaracteres._logrosDesbloqueados.has('20_palabras')) {
            uiCaracteres._logrosDesbloqueados.add('20_palabras');
            nuevosLogros.push('20_palabras');
        }

        if (totalDerivadas >= 50 && !uiCaracteres._logrosDesbloqueados.has('50_palabras')) {
            uiCaracteres._logrosDesbloqueados.add('50_palabras');
            nuevosLogros.push('50_palabras');
        }

        if (racha >= 3 && !uiCaracteres._logrosDesbloqueados.has('racha_3')) {
            uiCaracteres._logrosDesbloqueados.add('racha_3');
            nuevosLogros.push('racha_3');
        }

        if (racha >= 7 && !uiCaracteres._logrosDesbloqueados.has('racha_7')) {
            uiCaracteres._logrosDesbloqueados.add('racha_7');
            nuevosLogros.push('racha_7');
        }

        if (racha >= 30 && !uiCaracteres._logrosDesbloqueados.has('racha_30')) {
            uiCaracteres._logrosDesbloqueados.add('racha_30');
            nuevosLogros.push('racha_30');
        }

        if (nuevosLogros.length > 0) {
            await uiCaracteres._guardarLogros();

            for (const logroId of nuevosLogros) {
                const logro = uiCaracteres.LOGROS_BASE[logroId];
                if (logro && uiCaracteres._core) {
                    uiCaracteres._core.mostrarToast(`🏆 ¡Logro desbloqueado: ${logro.nombre}!`, 'success');
                }
            }

            const countEl = document.getElementById('logrosCount');
            if (countEl) {
                countEl.textContent = uiCaracteres._logrosDesbloqueados.size;
            }
        }
    }

    static async calcularRacha(uiCaracteres) {
        try {
            const progreso = await db.obtenerTodoProgreso();
            const fechas = progreso
                .filter(p => p.tipo === 'caracter' || p.tipo === 'caracter_derivada')
                .map(p => new Date(p.ultimoRepaso).toDateString());
            const uniqueFechas = [...new Set(fechas)].sort();
            let racha = 0;

            for (let i = uniqueFechas.length - 1; i >= 0; i--) {
                const fecha = new Date(uniqueFechas[i]);
                const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
                if (diff === racha) {
                    racha++;
                } else if (diff > racha) {
                    break;
                }
            }
            return racha;
        } catch (e) {
            return 0;
        }
    }

    static async obtenerLogrosCaracter(caracterId, uiCaracteres) {
        const logros = [];
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const familia = familias.find(f => f.caracterRaiz.id === caracterId);

        if (familia) {
            const derivadas = familia.palabrasDerivadas || [];
            if (derivadas.length >= 3) {
                logros.push({ icono: '📝', nombre: '3+ derivadas' });
            }
            if (derivadas.length >= 5) {
                logros.push({ icono: '📖', nombre: '5+ derivadas' });
            }
            if ((familia.caracterRaiz?.neuroScore || 0) >= 3) {
                logros.push({ icono: '🧠', nombre: 'RCN > 3' });
            }
            if ((familia.caracterRaiz?.neuroScore || 0) >= 4) {
                logros.push({ icono: '🌟', nombre: 'RCN > 4' });
            }
        }

        return logros;
    }
}

// ============================================================
// EXPORTAR PARA USO GLOBAL
// ============================================================

window.UICaracteresActions = UICaracteresActions;
console.log('✅ UICaracteres Actions v1.6 - CORREGIDO: ERROR EN FAVORITOS');
console.log('  🔧 Añade palabras a favoritos SOLO después de guardarlas en DB');
console.log('  🔧 Usa el ID devuelto por db.guardarPalabra()');
console.log('  🔧 Manejo de errores en favoritos sin romper la importación');
console.log('  📚 Todas las secciones se importan correctamente');
console.log('  🔄 Actualización inmediata de la vista después de importar');