// Sincronización opcional y local-first. La cola sobrevive a cierres y fallos.
(function (window) {
    'use strict';

    const MAX_ATTEMPTS = 8;
    const TABLES = Object.freeze({
        user_stories: 'user_stories',
        learning_states: 'learning_states',
        mode_states: 'mode_states'
    });

    class SyncManager {
        constructor() {
            this._running = false;
        }

        _getDatabase() {
            return window.db || (typeof db !== 'undefined' ? db : null);
        }

        async enqueue(entity, operation, payload) {
            const database = this._getDatabase();
            if (!database || !TABLES[entity]) throw new Error('Entidad no sincronizable: ' + entity);
            const record = {
                entity,
                operation,
                entityKey: payload?.local_key || payload?.content_key || payload?.id || crypto.randomUUID(),
                payload: structuredClone(payload || {}),
                queuedAt: new Date().toISOString(),
                attempts: 0,
                lastError: null
            };
            return database.add('sync_queue', record);
        }

        async pending() {
            const database = this._getDatabase();
            if (!database) return [];
            return database.getAll('sync_queue');
        }

        async syncNow() {
            if (this._running) return { status: 'running', processed: 0 };
            const client = window.PipelineSupabase?.getClient?.();
            const sessionInfo = await window.PipelineSupabase?.getSession?.();
            if (!client || !sessionInfo?.session) return { status: 'local-only', processed: 0 };

            this._running = true;
            const database = this._getDatabase();
            let processed = 0;
            try {
                const queue = (await this.pending()).sort((a, b) => a.id - b.id);
                for (const item of queue) {
                    if ((item.attempts || 0) >= MAX_ATTEMPTS) continue;
                    const result = await this._send(client, item);
                    if (result.ok) {
                        await database.delete('sync_queue', item.id);
                        processed += 1;
                    } else {
                        await database.update('sync_queue', {
                            ...item,
                            attempts: (item.attempts || 0) + 1,
                            lastError: result.error?.message || String(result.error || 'Sync error')
                        });
                    }
                }
                return { status: 'ok', processed };
            } finally {
                this._running = false;
            }
        }

        async _send(client, item) {
            const table = TABLES[item.entity];
            if (item.operation === 'delete') {
                const { error } = await client.from(table).update({
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('id', item.payload.id);
                return { ok: !error, error };
            }
            const { error } = await client.from(table).upsert(item.payload, {
                onConflict: item.entity === 'mode_states' ? 'user_id,mode,content_key' :
                    item.entity === 'user_stories' ? 'user_id,local_key' : 'user_id,content_key'
            });
            return { ok: !error, error };
        }
    }

    window.PipelineSync = new SyncManager();
})(window);
