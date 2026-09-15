// Catálogo público: lectura opcional y descarga local; publicación futura con revisión.
(function (window) {
    'use strict';
    const t = text => window.PipelineI18n?.t?.(text) || text;
    const Catalog = {
        async open() {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;z-index:1001;background:rgba(20,24,45,.62);display:flex;align-items:center;justify-content:center;padding:18px;';
            overlay.innerHTML = `<div style="width:min(700px,100%);max-height:calc(100vh - 36px);overflow:auto;background:var(--white);border-radius:18px;padding:24px;box-shadow:0 18px 60px rgba(0,0,0,.28);border-top:5px solid var(--secondary);"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;"><div><div style="font-size:30px;">🌐📚</div><h2 style="margin:4px 0;color:var(--dark);">${t('Catálogo Público')}</h2><p style="margin:0;color:var(--gray);font-size:13px;">${t('Historias y temas compartidos por la comunidad')}</p></div><button type="button" data-close style="border:0;background:var(--bg);border-radius:8px;padding:8px 11px;cursor:pointer;font-size:18px;">×</button></div><div style="margin:18px 0;padding:13px;background:var(--primary)08;border-radius:10px;color:var(--gray);font-size:13px;line-height:1.5;">${t('Puedes explorar y descargar contenido público sin tener cuenta. Tu progreso seguirá siendo local. Para publicar tus propias historias o sincronizar entre dispositivos, crea una cuenta de Supabase.')}</div><div id="publicCatalogItems" style="display:grid;gap:8px;"><div style="padding:14px;color:var(--gray);">${t('Cargando catálogo...')}</div></div><div style="display:flex;justify-content:flex-end;margin-top:18px;"><button type="button" data-close style="padding:9px 15px;border:1px solid var(--light);border-radius:8px;background:var(--white);cursor:pointer;">${t('Cerrar')}</button></div></div>`;
            overlay.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => overlay.remove()));
            overlay.addEventListener('click', event => { if (event.target === overlay) overlay.remove(); });
            document.body.appendChild(overlay);
            const list = overlay.querySelector('#publicCatalogItems');
            const client = window.PipelineSupabase?.getClient?.();
            if (!client) { list.innerHTML = `<div style="padding:14px;background:var(--bg);border-radius:9px;color:var(--gray);">${t('Catálogo no disponible ahora. Puedes continuar usando el contenido local.')}</div>`; return; }
            const sessionInfo = await window.PipelineSupabase?.getSession?.();
            if (sessionInfo?.session) {
                const profile = await client.from('profiles').select('role').eq('id', sessionInfo.session.user.id).maybeSingle();
                if (profile.data?.role === 'admin') await this.renderAdminPanel(overlay, client);
            }
            const { data, error } = await client.from('public_catalog').select('content_key,idioma,nivel,title,content_version,updated_at').eq('status', 'published').order('idioma').order('nivel');
            if (error || !data?.length) { list.innerHTML = `<div style="padding:14px;background:var(--bg);border-radius:9px;color:var(--gray);">${t('Todavía no hay contenido público disponible.')}</div>`; return; }
            list.innerHTML = data.map(item => `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 12px;background:var(--bg);border-radius:9px;"><div><strong style="color:var(--dark);">${item.title}</strong><div style="font-size:11px;color:var(--gray);">${item.idioma} · ${item.nivel} · v${item.content_version}</div></div><span style="font-size:11px;color:var(--secondary);">${t('Disponible')}</span></div>`).join('');
        },
        async renderAdminPanel(overlay, client) {
            const { data } = await client.from('catalog_submissions').select('id,title,idioma,nivel,content_key,created_at').eq('status', 'pending').order('created_at');
            const panel = document.createElement('div');
            panel.style.cssText = 'margin:14px 0;padding:14px;background:#fff8e8;border:1px solid #fdcb6e;border-radius:10px;';
            panel.innerHTML = `<strong style="color:var(--dark);">🛡️ ${t('Revisión de administradores')}</strong><div style="font-size:12px;color:var(--gray);margin:4px 0 10px;">${data?.length || 0} ${t('propuestas pendientes')}</div>` + ((data || []).map(item => `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #fdcb6e55;font-size:12px;"><span>${item.title} · ${item.idioma} · ${item.nivel}</span><button type="button" data-approve="${item.id}" style="padding:5px 9px;background:var(--success);color:white;border:0;border-radius:6px;cursor:pointer;">${t('Aprobar')}</button></div>`).join('') || `<div style="font-size:12px;color:var(--gray);">${t('No hay propuestas pendientes')}</div>`);
            overlay.querySelector('#publicCatalogItems').before(panel);
            panel.querySelectorAll('[data-approve]').forEach(button => button.addEventListener('click', async () => {
                const { data: submission, error } = await client.from('catalog_submissions').select('*').eq('id', button.dataset.approve).single();
                if (error || !submission) return;
                const published = await client.from('public_catalog').upsert({ content_key: submission.content_key, title: submission.title, idioma: submission.idioma, nivel: submission.nivel, content: submission.content, content_version: 1, status: 'published' }, { onConflict: 'content_key' });
                if (!published.error) await client.from('catalog_submissions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', submission.id);
                await this.open(); overlay.remove();
            }));
        }
    };
    window.PipelinePublicCatalog = Catalog;
})(window);
