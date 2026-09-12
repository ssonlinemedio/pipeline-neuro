// node --test tests/mi-espacio.cjs — isolated fixtures, no browser storage.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function fixture() {
    const storage = new Map();
    const ctx = vm.createContext({console, Date, Set, Map, Promise, setTimeout, clearTimeout,
        window: {}, document: {getElementById: () => null},
        localStorage: {getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v)},
        db: {obtenerProgreso: async () => null, obtenerProgresoCaracter: async () => null,
            obtenerPalabrasPorIdioma: async () => [], obtenerFrasesPorIdioma: async () => []},
        gestorIdiomas: {getIdiomaActivo: () => 'en'},
        gestorFavoritos: {obtenerFrasesFavoritas: async () => []},
        pipeline: {cargarFrase: async () => {}}
    });
    for (const file of ['ui.espacio.render.js', 'ui.espacio.actions.js']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/ui', file), 'utf8'), ctx);
    }
    ctx.render = vm.runInContext('UIEspacioRender', ctx);
    ctx.actions = vm.runInContext('UIEspacioActions', ctx);
    return {ctx, storage};
}
test('summary counts new and due sentences, without claiming saved words are practised', async () => {
    const {ctx} = fixture();
    ctx.db.obtenerProgreso = async id => ({2: {ultimoRepaso: 1, repasosExitosos:1, proximoRepaso: 1},3: {ultimoRepaso: 1, repasosExitosos:1, proximoRepaso: Date.now()+100000}}[id]);
    const result = await ctx.render.obtenerResumen([{id:1},{id:2},{id:3}], [{id:2}]);
    assert.equal(result.practicadas, 2);
    assert.deepEqual(Array.from(result.pendientes, f=>f.id), [1,2]);
    assert.equal(result.palabras, 1);
    ctx.db.obtenerProgreso = async () => ({ultimoRepaso:Date.now(),proximoRepaso:Date.now()+100000,repasosExitosos:0,repasosFallidos:0});
    const opened = await ctx.render.obtenerResumen([{id:1}], []);
    assert.equal(opened.practicadas,0);
    assert.equal(opened.pendientes.length,1);
});
test('word progress never uses a colliding sentence id; unpractised items count in denominator', async () => {
    const {ctx} = fixture();
    ctx.db.obtenerProgreso = async () => ({rcn:4});
    const result = await ctx.actions._calcularDominioFamilia([{id:1}], [{id:1}]);
    assert.equal(result.dominio, 50);
});
test('rendering achievements does not write or increase a streak', async () => {
    const {ctx,storage} = fixture();
    storage.set('racha_Comida_en', String(Date.now())); storage.set('racha_count_Comida_en','3');
    const before = JSON.stringify([...storage]);
    const result = await ctx.actions._calcularLogrosFamilia('Comida','en');
    assert.equal(result.racha,3);
    assert.equal(JSON.stringify([...storage]),before);
});
test('practice prioritises due saved sentences and excludes other languages', async () => {
    const {ctx} = fixture(); let module;
    ctx.gestorFavoritos.obtenerFrasesFavoritas = async () => [{id:1,idioma:'es'},{id:2,idioma:'en'},{id:3,idioma:'en'}];
    ctx.db.obtenerProgreso = async id => id===2 ? {ultimoRepaso:1,repasosExitosos:1,proximoRepaso:Date.now()+100000} : null;
    const ui = {_getCore:()=>({irAModulo: m=>module=m})};
    await ctx.render.practicarGuardadas(ui);
    assert.deepEqual(Array.from(ctx.pipeline.frases,f=>f.id),[3,2]);
    assert.equal(module,'study'); assert.equal(ui._iniciandoColeccion,false);
});
test('search value is escaped for HTML attributes', () => {
    const {ctx}=fixture();
    const html=ctx.render.renderizarBarraBusqueda({_filtros:{busqueda:'"<img src=x>',tipo:'todos'},NIVELES:[]});
    assert.ok(html.includes('&quot;&lt;img src=x&gt;'));
});
test('family study includes uncategorised saved sentences and respects level and language', async () => {
    const {ctx}=fixture();
    ctx.gestorFavoritos.obtenerPalabrasFavoritas=async()=>[];
    ctx.gestorFavoritos.obtenerFrasesFavoritas=async()=>[
        {id:1,idioma:'en',nivel:'A1'}, {id:2,idioma:'en',nivel:'B1'}, {id:3,idioma:'es',nivel:'A1'}
    ];
    const ui={_getCore:()=>({irAModulo:()=>{}}),_obtenerNivelRealUsuario:()=> 'A1',
        _mostrarDialogPersonalizado:async()=> 'frases',_mostrarToast:()=>{}};
    await ctx.actions.estudiarFamiliaDesdeEspacio('sin_clasificar','A1',ui);
    assert.deepEqual(Array.from(ctx.pipeline.frases,f=>f.id),[1]);
});
