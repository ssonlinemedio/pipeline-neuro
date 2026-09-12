// PHRASAL VERBS: detección contextual exclusiva para inglés.
// No se ejecuta para idiomas con escritura no latina ni altera la segmentación existente.
class PhrasalVerbs {
    constructor() {
        this.catalogo = new Map([
            ['get up','levantarse'],['wake up','despertarse'],['go out','salir'],['come back','volver'],
            ['look for','buscar'],['look at','mirar'],['look after','cuidar'],['take off','quitarse / despegar'],
            ['put on','ponerse'],['turn on','encender'],['turn off','apagar'],['find out','averiguar'],
            ['give up','rendirse'],['pick up','recoger'],['call back','devolver la llamada'],['try on','probarse'],
            ['fill in','rellenar'],['check in','registrarse'],['come in','entrar'],['sit down','sentarse']
        ]);
    }
    esIngles(idioma) { return /^(en|eng|english|inglés|ingles)$/i.test(String(idioma || '').trim()); }
    normalizar(texto) { return String(texto || '').toLowerCase().replace(/[.,!?;:()[\]{}]/g, ' '); }
    async extraerDesdeHistorias(frases, idioma) {
        if (!this.esIngles(idioma)) return [];
        const encontrados = new Map();
        for (const frase of frases || []) {
            const original = frase.original || '';
            const limpio = this.normalizar(original);
            for (const [expresion, significado] of this.catalogo) {
                if (limpio.includes(expresion)) {
                    const actual = encontrados.get(expresion) || { expresion, significado, ejemplos: [], niveles: new Set() };
                    actual.ejemplos.push({ texto: original, traduccion: frase.traduccion || '', fraseId: frase.id });
                    actual.niveles.add(frase.nivel || 'A1');
                    encontrados.set(expresion, actual);
                }
            }
        }
        return [...encontrados.values()].map(item => ({ ...item, niveles: [...item.niveles] }));
    }
}
window.PhrasalVerbs = new PhrasalVerbs();
