export default class BGM {
    private url: string;
    private volume: number;
    private didInit: boolean;
    private ready: boolean;
    private isPlaying: boolean;
    private audioContext: AudioContext | undefined;
    private gainNode: GainNode | undefined;
    private source: AudioBufferSourceNode | undefined;
    private buf: AudioBuffer | undefined;

    constructor(url: string, volume = 1) {
        this.url = url;
        this.volume = volume;
        this.didInit = false;
        this.ready = false;
        this.isPlaying = false;
    }

    init(playAfter: boolean, onAfterInit: () => void) {
        if (this.didInit) return;

        this.didInit = true;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);

        this.source = this.audioContext.createBufferSource();

        fetch(this.url)
            .then((resp) => resp.arrayBuffer())
            .then((buf) => this.audioContext?.decodeAudioData(buf)) // can be callback as well
            .then((decoded) => {
                if (!this.source) throw new Error('Source was somehow null');
                if (!decoded) throw new Error('Buffer was somehow null');
                if (!this.gainNode) throw new Error('Buffer was somehow null');
                this.buf = decoded;

                this.source.buffer = this.buf;
                this.source.loop = true;
                this.source.connect(this.gainNode);
                this.ready = true;

                if (playAfter) {
                    this.play();
                    onAfterInit();
                }
            })
            .catch((err) => console.error(err));
    }

    play(...args: number[]) {
        if (!this.ready || !this.source || this.isPlaying) return false;

        this.source.start(...args);
        this.isPlaying = true;
    }

    stop() {
        if (!this.ready || !this.source || !this.audioContext || !this.isPlaying || !this.buf || !this.gainNode) return;

        this.source.stop(0); // this destroys the buffer source
        const newSource = this.audioContext.createBufferSource(); // so we need to create a new one
        newSource.buffer = this.buf;
        newSource.loop = true;
        newSource.connect(this.gainNode);

        this.source = newSource;
        this.isPlaying = false;
    }
}
