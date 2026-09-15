// Cliente Supabase opcional. No participa en el arranque ni en el guardado local.
(function (window) {
    'use strict';

    const config = window.PIPELINE_SUPABASE_CONFIG;
    let client = null;

    window.PipelineSupabase = {
        isConfigured() {
            return Boolean(config?.enabled && config.url && config.publishableKey && window.supabase?.createClient);
        },

        getClient() {
            if (!this.isConfigured()) return null;
            if (!client) client = window.supabase.createClient(config.url, config.publishableKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            return client;
        },

        async getSession() {
            const supabase = this.getClient();
            if (!supabase) return { session: null, unavailable: true };
            const { data, error } = await supabase.auth.getSession();
            return { session: data?.session || null, error: error || null };
        }
    };
})(window);
