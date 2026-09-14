/* ============================================================
 * PROGRESIÓN MILITAR — rangos, misiones y condecoraciones
 * Persistencia ligera en localStorage; las métricas vienen de IndexedDB.
 * ============================================================ */
(function (global) {
    'use strict';

    const CLAVE = 'pipeline_progresion_militar_v1';
    const RANGOS = [
        { nombre: 'Recluta', icono: '🪖', minimo: 0 },
        { nombre: 'Soldado', icono: '🎖️', minimo: 10 },
        { nombre: 'Cabo', icono: '⭐', minimo: 30 },
        { nombre: 'Sargento', icono: '⭐⭐', minimo: 60 },
        { nombre: 'Teniente', icono: '⚔️', minimo: 100 },
        { nombre: 'Capitán', icono: '🏅', minimo: 160 },
        { nombre: 'Comandante', icono: '🛡️', minimo: 240 },
        { nombre: 'Teniente Coronel', icono: '🎗️', minimo: 350 }
    ];

    class ProgresionMilitar {
        constructor() {
            this.estado = this._leer();
            this._escucharActividad();
            window.addEventListener('ascensoMilitar', (e) => {
                const rango = e.detail?.rango;
                if (!rango) return;
                const mensaje = `🎖️ ¡Ascenso conseguido! Ahora eres ${rango.nombre}`;
                if (window.uiCore?.mostrarToast) window.uiCore.mostrarToast(mensaje, 'success');
                else console.log(mensaje);
            });
            window.addEventListener('formacionReclutaCompletada', () => window.UIDashboard?._cargarDashboardInicial?.());
        }

        _leer() {
            try { return JSON.parse(localStorage.getItem(CLAVE) || '{}'); } catch (e) { return {}; }
        }

        _guardar() {
            try { localStorage.setItem(CLAVE, JSON.stringify(this.estado)); } catch (e) { /* almacenamiento opcional */ }
        }

        _escucharActividad() {
            window.addEventListener('historiaEstadoCambiado', (e) => {
                if (e.detail?.completado) this.registrarActividad('onda');
            });
            window.addEventListener('progresoTemaActualizado', () => this.registrarActividad('estudio'));
        }

        registrarActividad(tipo = 'estudio') {
            const hoy = new Date().toISOString().slice(0, 10);
            if (this.estado.ultimoDia !== hoy) {
                this.estado.ultimoDia = hoy;
                this.estado.diasActivos = Number(this.estado.diasActivos || 0) + 1;
            }
            this.estado.actividades = Number(this.estado.actividades || 0) + 1;
            this.estado[`actividad_${tipo}`] = Number(this.estado[`actividad_${tipo}`] || 0) + 1;
            this._guardar();
        }

        async obtenerSnapshot(idioma) {
            const historias = await db?.obtenerHistorias?.() || [];
            const filtradas = idioma ? historias.filter(h => !h.idioma || h.idioma === idioma) : historias;
            const completadas = filtradas.filter(h => h.estado === 'completada' || h._completada === true).length;
            const frases = await db?.obtenerFrasesPorIdioma?.(idioma) || [];
            const progreso = await db?.obtenerTodoProgreso?.() || [];
            const dominadas = progreso.filter(p => Number(p.rcn || 0) >= 4 || p.estado === 'completada').length;
            const puntos = Math.min(999, (completadas * 10) + (dominadas * 2) + (Number(this.estado.diasActivos || 0) * 3));
            const formacionCompleta = this.estado.formacionRecluta === true;
            const indice = formacionCompleta ? Math.max(0, RANGOS.reduce((i, r, n) => puntos >= r.minimo ? n : i, 0)) : 0;
            const rango = RANGOS[indice];
            const siguiente = RANGOS[indice + 1] || null;
            const progresoRango = siguiente ? Math.round(((puntos - rango.minimo) / (siguiente.minimo - rango.minimo)) * 100) : 100;
            const rangoAnterior = Number(this.estado.ultimoRango || 0);
            if (indice > rangoAnterior) {
                this.estado.ultimoRango = indice;
                this._guardar();
                window.dispatchEvent(new CustomEvent('ascensoMilitar', { detail: { rango, indice } }));
            } else if (this.estado.ultimoRango === undefined) {
                this.estado.ultimoRango = indice;
                this._guardar();
            }
            const hoyActivo = this.estado.ultimoDia === new Date().toISOString().slice(0, 10);
            const misiones = !formacionCompleta ? [
                { paso: 1, texto: 'Lee las instrucciones básicas', hecho: this.estado.manualLeido === true, actual: this.estado.manualLeido === true ? 1 : 0, meta: 1, icono: '📖', detalle: this.estado.manualLeido === true ? '1/1 · instrucciones revisadas' : '0/1 · abre el manual de usuario' },
                { paso: 2, texto: 'Importa tu primera historia', hecho: this.estado.importacionProbada === true, actual: this.estado.importacionProbada === true ? 1 : 0, meta: 1, icono: '📥', detalle: this.estado.importacionProbada === true ? '1/1 · importación realizada' : '0/1 · usa Importar JSON en Temas' },
                { paso: 3, texto: 'Crea una onda Elipse o Cruzada', hecho: this.estado.ondaProbada === true, actual: this.estado.ondaProbada === true ? 1 : 0, meta: 1, icono: '🌌', detalle: this.estado.ondaProbada === true ? '1/1 · onda creada' : '0/1 · genera una onda desde Temas' },
                { paso: 4, texto: 'Completa el tutorial de estudio', hecho: this.estado.estudioProbado === true, actual: this.estado.estudioProbado === true ? 1 : 0, meta: 1, icono: '🎓', detalle: this.estado.estudioProbado === true ? '1/1 · flujo probado' : '0/1 · abre Study y escucha una frase' }
            ] : [
                { paso: 1, texto: 'Completa una historia u onda', hecho: completadas > 0, actual: Math.min(completadas, 1), meta: 1, icono: '📚', detalle: completadas > 0 ? '1/1 conseguido' : '0/1 · abre Biblioteca o Elipse' },
                { paso: 2, texto: 'Domina 5 frases con RCN ≥ 4', hecho: dominadas >= 5, actual: Math.min(dominadas, 5), meta: 5, icono: '🧠', detalle: `${Math.min(dominadas, 5)}/5 · ${Math.max(0, 5 - dominadas)} restantes` },
                { paso: 3, texto: 'Mantén una sesión hoy', hecho: hoyActivo, actual: hoyActivo ? 1 : 0, meta: 1, icono: '🔥', detalle: hoyActivo ? '1/1 · sesión registrada hoy' : '0/1 · estudia una frase o historia' },
                { paso: 4, texto: 'Objetivo semanal: domina 10 frases', hecho: dominadas >= 10, actual: Math.min(dominadas, 10), meta: 10, icono: '📅', detalle: `${Math.min(dominadas, 10)}/10 · ${Math.max(0, 10 - dominadas)} restantes esta semana` }
            ];
            const condecoraciones = [
                completadas >= 1 && 'Primera misión',
                completadas >= 5 && 'Comandante de ondas',
                dominadas >= 25 && 'Memoria de acero',
                Number(this.estado.diasActivos || 0) >= 7 && 'Constancia de campaña'
            ].filter(Boolean);
            const campañas = { en: 'Operación Londres', fr: 'Misión París', de: 'Campaña Berlín', it: 'Ruta Roma', zh: 'Ruta Pekín', ja: 'Desafío Tokio' };
            const idiomaBase = String(idioma || '').toLowerCase().slice(0, 2);
            const campaña = campañas[idiomaBase] || `Campaña ${idioma || 'global'}`;
            return { puntos, rango, siguiente, progresoRango, completadas, dominadas, frases: frases.length, misiones, condecoraciones, racha: Number(this.estado.diasActivos || 0), campaña, formacionCompleta };
        }

        async renderDashboard(idioma) {
            const s = await this.obtenerSnapshot(idioma);
            const siguiente = s.siguiente ? `${s.siguiente.icono} ${s.siguiente.nombre}` : 'Rango máximo';
            return `<section class="dm-neuro-panel" style="grid-column:1/-1;border:1px solid var(--primary);background:linear-gradient(135deg,var(--white),var(--bg));">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                    <div><div style="font-size:12px;color:var(--gray);">🎖️ Progresión de campaña</div><div style="display:inline-block;margin-top:3px;padding:3px 8px;border-radius:8px;background:var(--secondary)15;color:var(--secondary);font-size:11px;font-weight:700;">🗺️ ${s.campaña}</div>
                    <h3 style="margin:4px 0;font-size:22px;color:var(--primary);">${s.rango.icono} ${s.rango.nombre}</h3>
                    <div style="font-size:12px;color:var(--gray);">${s.puntos} puntos · próximo: ${siguiente}</div></div>
                    <button onclick="window.ProgresionMilitar.abrirPanel()" style="border:0;border-radius:9px;padding:9px 12px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;font-weight:700;cursor:pointer;">${s.formacionCompleta ? '📋 Informe de campaña' : '📖 Formación de recluta'}</button>
                    <div style="text-align:right;font-size:12px;color:var(--gray);">${s.completadas} historias · ${s.dominadas} frases dominadas<br>🔥 ${s.racha} días de campaña</div>
                </div>
                <div style="height:8px;background:var(--light);border-radius:8px;margin:12px 0 10px;overflow:hidden;"><div style="height:100%;width:${s.progresoRango}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:8px;"></div></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--gray);">
                    ${s.misiones.map(m => `<span style="padding:5px 8px;border-radius:10px;background:${m.hecho ? 'var(--success)15' : 'var(--bg)'};color:${m.hecho ? 'var(--success)' : 'var(--gray)'};">${m.hecho ? '✅' : m.icono} Paso ${m.paso}: ${m.texto} · ${m.detalle}</span>`).join('')}
                </div>
                ${s.condecoraciones.length ? `<div style="margin-top:10px;font-size:11px;color:var(--secondary);">🏅 ${s.condecoraciones.join(' · ')}</div>` : ''}
                <button class="btn-secondary" onclick="window.ProgresionMilitar.abrirPanel()" style="margin-top:12px;padding:5px 10px;font-size:11px;">📋 Abrir informe</button>
            </section>`;
        }

        abrirInstrucciones() {
            const pasos = ['Lee el manual de usuario y conoce el Dashboard', 'Importa una historia JSON desde Temas', 'Genera una onda Elipse u Onda Cruzada', 'Abre Study y escucha una frase con TTS'];
            const overlay = document.createElement('div');
            overlay.id = 'pipeline-recluta-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(15,23,42,.68);display:flex;align-items:center;justify-content:center;padding:18px;';
            overlay.innerHTML = `<div style="width:min(620px,100%);background:var(--white);border-radius:18px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25);"><div style="display:flex;justify-content:space-between;align-items:center;"><h2 style="margin:0;color:var(--primary);">🪖 Instrucciones del recluta</h2><button onclick="this.closest('#pipeline-recluta-overlay').remove()" style="border:0;background:var(--bg);padding:8px;border-radius:8px;">✕</button></div><p style="color:var(--gray);">Completa estos cuatro pasos para aprender a usar Pipeline Neuro y ascender a Soldado.</p><ol style="line-height:2.2;">${pasos.map(p => `<li>${p}</li>`).join('')}</ol><button onclick="window.ProgresionMilitar.marcarFormacionCompleta()" style="border:0;border-radius:9px;padding:10px 14px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;font-weight:700;cursor:pointer;">✅ He completado la formación</button></div>`;
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
            document.body.appendChild(overlay);
        }

        marcarFormacionCompleta() {
            this.estado.manualLeido = true;
            this.estado.importacionProbada = true;
            this.estado.ondaProbada = true;
            this.estado.estudioProbado = true;
            this.estado.formacionRecluta = true;
            this._guardar();
            document.getElementById('pipeline-recluta-overlay')?.remove();
            window.dispatchEvent(new CustomEvent('formacionReclutaCompletada'));
            window.uiCore?.mostrarToast?.('🎖️ Formación completada. Ya puedes ascender a Soldado.', 'success');
        }

        async abrirPanel() {
            const idioma = window.gestorIdiomas?.getIdiomaActivo?.() || 'es';
            const s = await this.obtenerSnapshot(idioma);
            document.getElementById('pipeline-campana-overlay')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'pipeline-campana-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.68);display:flex;align-items:center;justify-content:center;padding:18px;';
            overlay.innerHTML = `<div style="width:min(720px,100%);max-height:90vh;overflow:auto;background:var(--white);border-radius:18px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25);">
                <div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="color:var(--gray);font-size:12px;">🎖️ ${s.campaña} · INFORME DE CAMPAÑA · v1.3</div><h2 style="margin:5px 0;color:var(--primary);">${s.rango.icono} ${s.rango.nombre}</h2></div><button onclick="this.closest('#pipeline-campana-overlay').remove()" style="border:0;background:var(--bg);border-radius:8px;padding:8px;cursor:pointer;">✕</button></div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:18px 0;"><div style="padding:12px;background:var(--bg);border-radius:10px;"><b>${s.puntos}</b><small style="display:block;color:var(--gray);">Puntos</small></div><div style="padding:12px;background:var(--bg);border-radius:10px;"><b>${s.completadas}</b><small style="display:block;color:var(--gray);">Historias</small></div><div style="padding:12px;background:var(--bg);border-radius:10px;"><b>${s.dominadas}</b><small style="display:block;color:var(--gray);">Frases dominadas</small></div><div style="padding:12px;background:var(--bg);border-radius:10px;"><b>🔥 ${s.racha}</b><small style="display:block;color:var(--gray);">Días activos</small></div></div>
                <h3>🎯 Misión de campaña · pasos</h3><div style="display:grid;gap:9px;">${s.misiones.map(m => `<div style="padding:10px;border-radius:9px;background:${m.hecho ? 'var(--success)12' : 'var(--bg)'};color:${m.hecho ? 'var(--success)' : 'var(--dark)'};"><div style="font-weight:700;">${m.hecho ? '✅' : m.icono} Paso ${m.paso}/4 · ${m.texto}</div><div style="font-size:11px;margin-top:4px;color:${m.hecho ? 'var(--success)' : 'var(--gray)'};">${m.detalle}</div><div style="height:5px;background:var(--light);border-radius:5px;margin-top:7px;overflow:hidden;"><div style="height:100%;width:${Math.round((m.actual / m.meta) * 100)}%;background:${m.hecho ? 'var(--success)' : 'var(--primary)'};"></div></div></div>`).join('')}</div>
                <h3>🏅 Condecoraciones</h3><div style="color:var(--secondary);">${s.condecoraciones.length ? s.condecoraciones.map(x => `<span style="display:inline-block;padding:7px 10px;margin:3px;background:var(--secondary)12;border-radius:10px;">🏅 ${x}</span>`).join('') : 'Aún no hay condecoraciones. La primera misión te espera.'}</div>
            </div>`;
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
            document.body.appendChild(overlay);
        }
    }

    global.ProgresionMilitar = new ProgresionMilitar();
})(window);
