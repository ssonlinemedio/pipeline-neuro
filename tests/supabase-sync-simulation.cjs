const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createDevice(userId, online) {
    const rows = [];
    const db = {
        async add(store, data) { const row = { ...data, id: rows.length + 1 }; rows.push(row); return row.id; },
        async getAll() { return rows.map(row => ({ ...row })); },
        async update(store, data) { const index = rows.findIndex(row => row.id === data.id); rows[index] = { ...rows[index], ...data }; return rows[index]; },
        async delete(store, id) { const index = rows.findIndex(row => row.id === id); rows.splice(index, 1); }
    };
    const sent = [];
    const window = {
        db,
        addEventListener() {},
        structuredClone,
        crypto: { randomUUID: () => 'generated-id' },
        PipelineSupabase: {
            getClient: () => online ? {
                from: table => ({ select: () => ({ is: async () => ({ data: [], error: null }) }), upsert: async (payload, options) => {
                    sent.push({ table, payload, options });
                    assert.equal(payload.user_id, userId, 'RLS identity must come from the authenticated session');
                    return { error: null };
                } })
            } : null,
            getSession: async () => online ? { session: { user: { id: userId } } } : { session: null }
        }
    };
    const context = { window, document: { addEventListener() {} }, structuredClone, crypto: window.crypto, console };
    vm.runInNewContext(fs.readFileSync('js/core/syncManager.js', 'utf8'), context);
    return { window, rows, sent, sync: window.PipelineSync, setOnline(value) { online = value; } };
}

(async () => {
    const deviceA = createDevice('user-a', false);
    const deviceB = createDevice('user-a', true);
    await deviceA.sync.enqueue('learning_states', 'upsert', { content_key: 'zh-a1-historia-1-frase-1', state: { rcn: 2 } });
    await deviceA.sync.enqueue('learning_states', 'upsert', { content_key: 'zh-a1-historia-1-frase-1', state: { rcn: 3 } });
    assert.equal((await deviceA.sync.pending()).length, 1, 'repeated local updates must coalesce');
    assert.equal((await deviceA.sync.syncNow()).status, 'local-only', 'offline mode must not discard work');
    deviceA.setOnline(true);
    const resultA = await deviceA.sync.syncNow();
    assert.equal(resultA.processed, 1, 'reconnected device must flush its queue');

    await deviceB.sync.enqueue('learning_states', 'upsert', { content_key: 'zh-a1-historia-1-frase-1', state: { rcn: 4 } });
    assert.equal((await deviceB.sync.syncNow()).processed, 1, 'second device must sync the same user');
    assert.equal(deviceB.sent[0].payload.user_id, 'user-a');

    const deviceC = createDevice('user-b', true);
    await deviceC.sync.enqueue('learning_states', 'upsert', { content_key: 'zh-a1-historia-1-frase-1', state: { rcn: 1 } });
    await deviceC.sync.syncNow();
    assert.equal(deviceC.sent[0].payload.user_id, 'user-b', 'different users must have different ownership');
    assert.notEqual(deviceB.sent[0].payload.user_id, deviceC.sent[0].payload.user_id);

    console.log('Supabase sync simulation: PASS');
    console.log('PASS offline queue retention');
    console.log('PASS coalescing repeated updates');
    console.log('PASS reconnect flush');
    console.log('PASS two devices same user');
    console.log('PASS user isolation identity');
})().catch(error => { console.error(error); process.exitCode = 1; });
