// UI de cuenta opcional: nunca sustituye al registro local.
(function (window) {
    'use strict';
    const t = text => window.PipelineI18n?.t?.(text) || text;

    const AuthUI = {
        render() {
            return `<div class="config-section supabase-account-section" style="background:linear-gradient(135deg,var(--white),var(--primary)08);border:2px solid var(--primary)20;border-radius:14px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;"><span style="font-size:30px;">☁️</span><div><h3 style="font-size:16px;margin:0;color:var(--dark);">Cuenta y sincronización</h3><p style="font-size:12px;color:var(--gray);margin:3px 0;">Opcional: protege tu progreso y continúa en otros dispositivos.</p></div></div>
                <div id="supabaseAuthStatus" style="font-size:12px;color:var(--gray);padding:8px 10px;background:var(--bg);border-radius:8px;margin-bottom:10px;">Comprobando estado de la cuenta...</div>
                <div id="supabaseAuthForm" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;">
                    <input id="supabaseAuthEmail" type="email" autocomplete="email" placeholder="Correo electrónico" style="padding:8px 10px;border:2px solid var(--light);border-radius:8px;font-size:13px;">
                    <input id="supabaseAuthPassword" type="password" autocomplete="current-password" placeholder="Contraseña" style="padding:8px 10px;border:2px solid var(--light);border-radius:8px;font-size:13px;">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;"><button class="btn-primary" type="button" onclick="window.PipelineSupabaseAuth.signIn()" style="padding:8px 14px;border:0;border-radius:8px;cursor:pointer;">Iniciar sesión</button><button class="btn-secondary" type="button" onclick="window.PipelineSupabaseAuth.signUp()" style="padding:8px 14px;border:1px solid var(--light);border-radius:8px;cursor:pointer;">Crear cuenta</button></div>
                </div>
                <div id="supabaseAuthActions" style="display:none;gap:8px;flex-wrap:wrap;margin-top:8px;"><button class="btn-primary" type="button" onclick="window.PipelineSupabaseAuth.sync()" style="padding:8px 14px;border:0;border-radius:8px;cursor:pointer;">Sincronizar ahora</button><button class="btn-secondary" type="button" onclick="window.PipelineSupabaseAuth.signOut()" style="padding:8px 14px;border:1px solid var(--light);border-radius:8px;cursor:pointer;">Cerrar sesión</button></div>
            </div>`;
        },
        _fields() { return { email: document.getElementById('supabaseAuthEmail')?.value.trim(), password: document.getElementById('supabaseAuthPassword')?.value }; },
        _message(text, error) { const node = document.getElementById('supabaseAuthStatus'); if (node) { node.textContent = text; node.style.color = error ? 'var(--danger,#d63031)' : 'var(--gray)'; } },
        async refresh() { const info = await window.PipelineSupabase?.getSession?.(); const session = info?.session; const form = document.getElementById('supabaseAuthForm'); const actions = document.getElementById('supabaseAuthActions'); if (session) { if (form) form.style.display = 'none'; if (actions) actions.style.display = 'flex'; this._message('Sesión activa. Tus datos locales siguen disponibles.', false); } else if (!info?.unavailable) this._message('Sin cuenta conectada. La aplicación funciona en modo local.', false); },
        async signIn() { const { email, password } = this._fields(); if (!email || !password) return this._message('Introduce correo y contraseña.', true); const client = window.PipelineSupabase?.getClient?.(); if (!client) return this._message('La sincronización no está disponible ahora.', true); const { error } = await client.auth.signInWithPassword({ email, password }); if (error) return this._message(error.message, true); this._message('Sesión iniciada. La sincronización está disponible.', false); await this.refresh(); },
        async signUp() { const { email, password } = this._fields(); if (!email || !password) return this._message('Introduce correo y contraseña.', true); if (password.length < 6) return this._message('La contraseña debe tener al menos 6 caracteres.', true); const client = window.PipelineSupabase?.getClient?.(); if (!client) return this._message('La sincronización no está disponible ahora.', true); const { error } = await client.auth.signUp({ email, password }); if (error) return this._message(error.message, true); this._message('Cuenta creada. Revisa tu correo si se solicita confirmación.', false); },
        async signOut() { const client = window.PipelineSupabase?.getClient?.(); if (client) await client.auth.signOut(); this._message('Sesión cerrada. Tus datos locales se conservan.', false); const form = document.getElementById('supabaseAuthForm'); const actions = document.getElementById('supabaseAuthActions'); if (form) form.style.display = 'grid'; if (actions) actions.style.display = 'none'; },
        async sync() { const result = await window.PipelineSync?.syncNow?.(); this._message(result?.status === 'ok' ? `Sincronización completada: ${result.processed} cambios.` : 'No hay una sesión sincronizable ahora.', result?.status === 'error'); }
    };
    window.PipelineSupabaseAuth = AuthUI;
})(window);
