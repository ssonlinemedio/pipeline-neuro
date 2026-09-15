// Sincronización opcional y local-first. La cola sobrevive a cierres y fallos.
(function (window) {
    'use strict';

    const MAX_ATTEMPTS = 8;
    const TABLES = Object.freeze({
        user_stories: 'user_stories',
        user_topics: 'user_topics',
        learning_states: 'learning_states',
        mode_states: 'mode_states'
    });

    class SyncManager {
        constructor() {
            this._running = false;
            window.addEventListener('online', () => this.syncNow().catch(error =>
                console.warn('⚠️ Sincronización al recuperar conexión:', error)));
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this.syncNow().catch(error =>
                        console.warn('⚠️ Sincronización al volver a la aplicación:', error));
                }
            });
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
            const pendientes = await database.getAll('sync_queue');
            const anterior = pendientes.find(item => item.entity === entity &&
                item.operation === operation && item.entityKey === record.entityKey);
            if (anterior) {
                return database.update('sync_queue', {
                    ...anterior,
                    payload: record.payload,
                    queuedAt: record.queuedAt,
                    lastError: null
                });
            }
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
                const pulledTopics = await this.pullUserTopics(client);
                const pulledStories = await this.pullUserStories(client);
                const pulled = await this.pullLearningStates(client);
                return { status: 'ok', processed, pulled, pulledStories, pulledTopics };
            } finally {
                this._running = false;
            }
        }

        async pullUserStories(client) {
            const database = this._getDatabase();
            if (!database) return 0;
            const { data, error } = await client.from(TABLES.user_stories)
                .select('local_key,title,content,content_version,created_at,updated_at,version,deleted_at')
                .is('deleted_at', null);
            if (error || !Array.isArray(data)) return 0;
            const localStories = await database.getAll('historias');
            const byKey = new Map(localStories.filter(story => story.localKey).map(story => [story.localKey, story]));
            let applied = 0;
            for (const remote of data) {
                if (!remote.local_key || !remote.content || typeof remote.content !== 'object') continue;
                const local = byKey.get(remote.local_key);
                const remoteVersion = Number(remote.version || 1);
                const localVersion = Number(local?._syncVersion || 0);
                const remoteTime = Date.parse(remote.updated_at || '') || 0;
                const localTime = Date.parse(local?._syncUpdatedAt || '') || 0;
                if (local && localVersion > remoteVersion) continue;
                if (local && localVersion === remoteVersion && localTime >= remoteTime) continue;
                const source = { ...remote.content };
                delete source.id;
                const frases = Array.isArray(source.frases) ? source.frases : [];
                delete source.frases;
                if (source.tema_local_key) {
                    const topic = await database.getAll('temas');
                    const linked = topic.find(item => item.localKey === source.tema_local_key);
                    if (linked) source.temaId = linked.id;
                    delete source.tema_local_key;
                }
                const historia = {
                    ...source,
                    localKey: remote.local_key,
                    titulo: source.titulo || remote.title || 'Historia sincronizada',
                    _esPredefinido: false,
                    _syncVersion: Number(remote.version || 1),
                    _syncUpdatedAt: remote.updated_at || new Date().toISOString(),
                    _contentVersion: Number(remote.content_version || source._contentVersion || 1),
                    fechaCreacion: source.fechaCreacion || remote.created_at || new Date().toISOString()
                };
                let historiaId = local?.id;
                if (historiaId) {
                    await database.update('historias', { ...historia, id: historiaId });
                    const antiguas = await database.getByIndex('frases', 'historiaId', Number(historiaId));
                    for (const frase of antiguas) await database.delete('frases', frase.id);
                } else {
                    historiaId = await database.add('historias', historia);
                }
                if (!historiaId) continue;
                for (const frase of frases) {
                    const copia = { ...frase };
                    delete copia.id;
                    await database.add('frases', { ...copia, historiaId: Number(historiaId) });
                }
                byKey.set(remote.local_key, { ...historia, id: historiaId });
                applied += 1;
            }
            return applied;
        }

        async pullUserTopics(client) {
            const database = this._getDatabase();
            if (!database) return 0;
            const { data, error } = await client.from(TABLES.user_topics)
                .select('local_key,name,content,version,created_at,updated_at,deleted_at')
                .is('deleted_at', null);
            if (error || !Array.isArray(data)) return 0;
            const localTopics = await database.getAll('temas');
            const byKey = new Map(localTopics.filter(topic => topic.localKey).map(topic => [topic.localKey, topic]));
            let applied = 0;
            for (const remote of data) {
                if (!remote.local_key || !remote.content || typeof remote.content !== 'object') continue;
                const local = byKey.get(remote.local_key);
                const remoteVersion = Number(remote.version || 1);
                const localVersion = Number(local?._syncVersion || 0);
                const remoteTime = Date.parse(remote.updated_at || '') || 0;
                const localTime = Date.parse(local?._syncUpdatedAt || '') || 0;
                if (local && localVersion > remoteVersion) continue;
                if (local && localVersion === remoteVersion && localTime >= remoteTime) continue;
                const topic = { ...remote.content, localKey: remote.local_key, _syncVersion: remoteVersion, _syncUpdatedAt: remote.updated_at || new Date().toISOString() };
                delete topic.id;
                const id = local?.id || await database.add('temas', topic);
                if (!id) continue;
                await database.update('temas', { ...topic, id });
                byKey.set(remote.local_key, { ...topic, id });
                applied += 1;
            }
            return applied;
        }

        async pullLearningStates(client) {
            const database = this._getDatabase();
            if (!database) return 0;
            const { data, error } = await client.from(TABLES.learning_states)
                .select('content_key,content_version,state,updated_at,version')
                .is('deleted_at', null);
            if (error || !Array.isArray(data)) return 0;
            const pending = await database.getAll('sync_queue');
            const pendingKeys = new Set(pending.filter(item => item.entity === 'learning_states').map(item => item.entityKey));
            let applied = 0;
            for (const remote of data) {
                if (pendingKeys.has(remote.content_key)) continue;
                const match = String(remote.content_key || '').match(/^legacy:[^:]+:(\d+)$/);
                if (!match || !remote.state || typeof remote.state !== 'object') continue;
                const local = await database.get('progreso', Number(match[1]));
                if (!local || Number(local.version || 0) > Number(remote.version || 0)) continue;
                await database.update('progreso', { ...remote.state, id: local.id, version: Number(remote.version || local.version || 1) });
                applied += 1;
            }
            return applied;
        }

        async _send(client, item) {
            const table = TABLES[item.entity];
            const sessionInfo = await window.PipelineSupabase.getSession();
            const userId = sessionInfo.session?.user?.id;
            if (!userId) return { ok: false, error: new Error('No authenticated user') };
            if (item.operation === 'delete') {
                const { error } = await client.from(table).update({
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('id', item.payload.id);
                return { ok: !error, error };
            }
            const { error } = await client.from(table).upsert({ ...item.payload, user_id: userId }, {
                onConflict: item.entity === 'mode_states' ? 'user_id,mode,content_key' :
                    item.entity === 'user_stories' ? 'user_id,local_key' :
                        item.entity === 'user_topics' ? 'user_id,local_key' : 'user_id,content_key'
            });
            return { ok: !error, error };
        }
    }

    window.PipelineSync = new SyncManager();
})(window);
