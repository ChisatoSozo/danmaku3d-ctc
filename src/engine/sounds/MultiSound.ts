import { times } from 'lodash';
import { LS } from '../containers/LSContainer';

export default class MultiSound {
    private url: string;
    private volume: number;
    private didInit: boolean;
    private ready: boolean;
    private curSource: number;
    private startTime: number;
    private num: number;
    private cooldown: number;
    private playing: boolean[];
    private initFunc: () => void;
    private audioContext: AudioContext | undefined;
    private gainNode: GainNode | undefined;
    private sources: AudioBufferSourceNode[];
    private buf: AudioBuffer | undefined;

    constructor(url: string, volume = 0.1, num = 1, cooldown = 50) {
        this.url = url;
        this.volume = volume;
        this.url = url;
        this.volume = volume;
        this.didInit = false;
        this.ready = false;
        this.curSource = 0;
        this.startTime = 0;
        this.sources = [];
        this.num = num;
        this.playing = times(num, () => false);
        this.cooldown = cooldown;

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

        this.sources = times(this.num, () => {
            if (!this.audioContext) throw new Error('audioContext was not defined');
            return this.audioContext.createBufferSource();
        });

        fetch(this.url)
            .then((resp) => resp.arrayBuffer())
            .then((buf) => this.audioContext?.decodeAudioData(buf)) // can be callback as well
            .then((decoded) => {
                if (!decoded) return;
                this.sources.forEach((source) => {
                    source.buffer = this.buf = decoded;
                });
                this.sources.forEach((source) => {
                    source.loop = false;
                });
                this.sources.forEach((source) => {
                    this.gainNode ? source.connect(this.gainNode) : null;
                });

                this.ready = true;
            })
            .catch((err) => console.error(err));
    }

    play() {
        if (!this.ready) return;
        if (this.startTime && Date.now() - this.startTime < this.cooldown / this.num) return;
        if (LS.SFX === 'OFF') return;

        this.stop(this.curSource);

        this.sources[this.curSource].start(0);
        this.playing[this.curSource] = true;
        this.startTime = Date.now();

        this.curSource = (this.curSource + 1) % this.num;
    }

    stop(source: number) {
        if (!this.ready || !this.playing[source]) return;
        if (!this.audioContext || !this.buf || !this.gainNode) return;

        this.sources[source].stop(0); // this destroys the buffer source
        const newSource = this.audioContext.createBufferSource(); // so we need to create a new one
        newSource.buffer = this.buf;
        newSource.loop = false;
        newSource.connect(this.gainNode);
        this.sources[source] = newSource;
        this.playing[source] = false;
    }
}
