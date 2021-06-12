import { LS } from '../containers/LSContext';

export default class LoopingSound {
    private url: string;
    private volume: number;
    private didInit: boolean;
    private ready: boolean;
    private overlap: number;
    private playing: boolean;
    private initFunc: () => void;
    private audioContext: AudioContext | undefined;
    private gainNode: GainNode | undefined;
    private sources: AudioBufferSourceNode[] | undefined;
    private buf: AudioBuffer | undefined;

    constructor(url: string, volume = 1, overlap = 2) {
        this.url = url;
        this.volume = volume;
        this.didInit = false;
        this.playing = false;
        this.ready = false;
        this.overlap = overlap;

        this.initFunc = () => this.init();

        document.body.addEventListener('keydown', this.initFunc);
        document.body.addEventListener('click', this.initFunc);
        document.body.addEventListener('touchstart', this.initFunc);
    }

    init() {
        if (this.didInit) return;

        document.body.removeEventListener('keydown', this.initFunc);
        document.body.removeEventListener('click', this.initFunc);
        document.body.removeEventListener('touchstart', this.initFunc);
        this.didInit = true;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);

        this.sources = [];
        for (let i = 0; i < this.overlap; i++) {
            this.sources.push(this.audioContext.createBufferSource());
        }

        fetch(this.url)
            .then((resp) => resp.arrayBuffer())
            .then((buf) => this.audioContext?.decodeAudioData(buf)) // can be callback as well
            .then((decoded) => {
                if (!this.sources) throw new Error('Source was somehow null');
                if (!decoded) throw new Error('Buffer was somehow null');
                this.sources.forEach((source) => {
                    source.buffer = this.buf = decoded;
                    source.loop = true;
                    if (!this.gainNode) throw new Error('Buffer was somehow null');
                    source.connect(this.gainNode);
                });
                this.ready = true;
            })
            .catch((err) => console.error(err));
    }

    play() {
        if (!this.ready || this.playing) return;
        if (LS.SFX === 'OFF') return;

        this.sources?.forEach((source, i) => {
            if (!source.buffer) return;
            if (!this.sources) return;
            source.start(0, source.buffer.duration * (i / this.sources.length));
        });
        this.playing = true;
    }

    stop() {
        if (!this.ready || !this.playing) return;

        const newSources: AudioBufferSourceNode[] = [];

        this.sources?.forEach((source) => {
            source.stop(0); // this destroys the buffer source
            const newSource = this.audioContext?.createBufferSource(); // so we need to create a new one
            if (!newSource) return;
            if (!this.buf) return;
            if (!this.gainNode) return;
            newSource.buffer = this.buf;
            newSource.loop = true;
            newSource.connect(this.gainNode);
            newSources.push(newSource);
        });

        this.sources = newSources;

        this.playing = false;
    }
}
