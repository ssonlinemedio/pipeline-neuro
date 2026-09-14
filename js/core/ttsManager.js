/* Pipeline Neuro - Gestor TTS V1. No genera ni almacena archivos de audio. */
(function (global) {
    'use strict';

    const PREFIX = 'pipeline_tts_';
    const IDIOMAS = {
        zh: ['zh-CN', 'zh-TW'], chino: ['zh-CN'], chinese: ['zh-CN'], mandarin: ['zh-CN'], mandarín: ['zh-CN'],
        ja: ['ja-JP'], japonés: ['ja-JP'], japanese: ['ja-JP'], ko: ['ko-KR'], coreano: ['ko-KR'], korean: ['ko-KR'],
        es: ['es-ES', 'es-MX', 'es-US'], español: ['es-ES'], spanish: ['es-ES'], en: ['en-US', 'en-GB', 'en-AU'], inglés: ['en-US'], english: ['en-US'],
        fr: ['fr-FR', 'fr-CA'], francés: ['fr-FR'], french: ['fr-FR'], de: ['de-DE', 'de-AT', 'de-CH'], alemán: ['de-DE'], german: ['de-DE'],
        it: ['it-IT'], italiano: ['it-IT'], italian: ['it-IT'], pt: ['pt-PT', 'pt-BR'], portugués: ['pt-PT'], portuguese: ['pt-PT'],
        ru: ['ru-RU'], ruso: ['ru-RU'], russian: ['ru-RU']
    };

    class TTSManager {
        constructor() {
            this._synth = global.speechSynthesis || null;
            this._voices = [];
            this._queue = [];
            this._index = 0;
            this._token = 0;
            this._current = null;
            this._rate = this._loadRate();
            if (this._synth) {
                this._loadVoices();
                this._synth.addEventListener?.('voiceschanged', () => this._loadVoices());
            }
        }
        isSupported() { return Boolean(this._synth && global.SpeechSynthesisUtterance); }
        getAllVoices() { return [...this._voices]; }
        getVoices(lang) { const codes = this._codes(lang); return codes.length ? this._voices.filter(v => codes.some(c => this._matches(v.lang, c))) : [...this._voices]; }
        getRate() { return this._rate; }
        setRate(rate) {
            const value = Number(rate);
            if (!Number.isFinite(value)) return this._rate;
            this._rate = Math.min(1.4, Math.max(0.6, value));
            try { global.localStorage?.setItem(`${PREFIX}rate`, String(this._rate)); } catch (e) { /* opcional */ }
            return this._rate;
        }
        getPreferredVoice(lang) {
            let saved = null;
            try { saved = global.localStorage?.getItem(`${PREFIX}voice_${this._normal(lang)}`); } catch (e) { /* opcional */ }
            const voices = this.getVoices(lang);
            return voices.find(v => v.voiceURI === saved || v.name === saved) || voices[0] || null;
        }
        setVoice(lang, voice) {
            if (!lang || !voice) return;
            try { global.localStorage?.setItem(`${PREFIX}voice_${this._normal(lang)}`, voice.voiceURI || voice.name); } catch (e) { /* opcional */ }
        }
        speak(text, options = {}) {
            const entradas = Array.isArray(text) ? text : [text];
            const tieneTexto = entradas.some(item => String(item?.text ?? item ?? '').trim());
            if (!this.isSupported() || !tieneTexto) return Promise.resolve(false);
            this.stop();
            this._queue = entradas.map(item => {
                if (item && typeof item === 'object') return { text: String(item.text || '').trim(), lang: item.lang || options.lang };
                return { text: String(item || '').trim(), lang: options.lang };
            }).filter(item => item.text);
            this._index = 0;
            this._current = { options, resolve: null };
            const token = ++this._token;
            return new Promise(resolve => { this._current.resolve = resolve; this._next(token); });
        }
        pause() { if (this.isSupported() && this._synth.speaking && !this._synth.paused) this._synth.pause(); }
        resume() { if (this.isSupported() && this._synth.paused) this._synth.resume(); }
        stop() {
            this._token++;
            if (this.isSupported()) this._synth.cancel();
            this._current?.resolve?.(false);
            this._current = null; this._queue = []; this._index = 0;
        }
        repeat(text, options = {}) { return this.speak(text, options); }
        _next(token) {
            if (!this._current || token !== this._token || this._index >= this._queue.length) { this._current?.resolve?.(true); this._current = null; return; }
            const settings = this._current.options;
            const item = this._queue[this._index++];
            const utterance = new global.SpeechSynthesisUtterance(item.text);
            const lang = item.lang || settings.lang || 'es';
            utterance.lang = this._codes(lang)[0] || lang;
            utterance.rate = Number.isFinite(Number(settings.rate)) ? this.setRate(settings.rate) : this._rate;
            utterance.pitch = Number(settings.pitch) || 1;
            utterance.volume = Number.isFinite(Number(settings.volume)) ? Number(settings.volume) : 1;
            utterance.voice = settings.voice || this.getPreferredVoice(lang) || null;
            utterance.onend = () => this._next(token);
            utterance.onerror = event => { if (!['canceled', 'interrupted'].includes(event.error)) settings.onError?.(event); this._current?.resolve?.(false); this._current = null; };
            settings.onStart?.(this._index - 1, this._queue.length);
            this._synth.speak(utterance);
        }
        _loadVoices() { this._voices = this._synth?.getVoices?.() || []; }
        _normal(lang) { return String(lang || '').trim().toLowerCase(); }
        _codes(lang) { const normalized = this._normal(lang); return IDIOMAS[normalized] || (normalized ? [normalized] : []); }
        _matches(actual, expected) { const a = String(actual || '').toLowerCase(), e = expected.toLowerCase(); return a === e || a.startsWith(`${e.split('-')[0]}-`); }
        _loadRate() { try { const value = Number(global.localStorage?.getItem(`${PREFIX}rate`)); return Number.isFinite(value) ? Math.min(1.4, Math.max(0.6, value)) : 1; } catch (e) { return 1; } }
    }
    global.TTS = new TTSManager();
})(window);
