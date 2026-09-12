const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function fixture(records = []) {
    const ctx = vm.createContext({console});
    const source = fs.readFileSync(require('node:path').join(__dirname, '../js/database.js'), 'utf8');
    vm.runInContext(source.split('const db = new Database();')[0] + '\nglobalThis.proto = Database.prototype;', ctx);
    const db = Object.create(ctx.proto);
    db._initialized = true;
    db._esJeroglifico = () => true;
    db.obtenerPalabras = async () => records;
    db.update = async (_, value) => { records[0] = value; };
    db.add = async (_, value) => { records.push({...value, id: 1}); return 1; };
    return {db, records};
}
test('conserva familia semántica y tipo en palabras nuevas', async () => {
    const {db, records} = fixture();
    await db.guardarPalabra({hanzi:'喝', idioma:'zh', familia:'Comida y Bebida', tipo:'verbo'});
    assert.equal(records[0].familiaSemantica, 'Comida y Bebida');
    assert.equal(records[0].tipo, 'verbo');
});
test('recupera General sin duplicar ni perder progreso del registro', async () => {
    const {db, records} = fixture([{id:7, hanzi:'雨', idioma:'zh', familia:'sustantivo', familiaSemantica:'General', tipo:'sustantivo', neuroScore:0.9}]);
    const id = await db.guardarPalabra({hanzi:'雨', idioma:'zh', familia_semantica:'Tiempo y Clima'});
    assert.equal(id,7);
    assert.equal(records.length,1);
    assert.equal(records[0].familiaSemantica,'Tiempo y Clima');
    assert.equal(records[0].neuroScore,0.9);
    await db.guardarPalabra({hanzi:'雨', idioma:'zh', familiaSemantica:'General'});
    assert.equal(records[0].familiaSemantica,'Tiempo y Clima');
});
