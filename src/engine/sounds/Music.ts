import { LS } from '../containers/LSContext';
import BGM from './BGM';

class MusicClass {
    private BGMs: { [key: string]: BGM };
    private initFunc: () => void;
    private didInit: boolean;
    private startedAt: number;
    private activeSound: string | null;
    private pausedAt: number;

    constructor() {
        this.didInit = false;
        this.BGMs = {};
        // this.BGMs.menuTheme = new BGM('/music/titleTheme.mp3', 0.3);
        // this.BGMs.stage1Theme = new BGM('/music/stage1.mp3', 0.3);
        // this.BGMs.wriggleTheme = new BGM('/music/wriggleTheme.mp3', 0.3);
        this.startedAt = 0;
        this.pausedAt = 0;
        this.activeSound = null;

        this.initFunc = () => this.init();

        document.body.addEventListener('keydown', this.initFunc);
        document.body.addEventListener('click', this.initFunc);
        document.body.addEventListener('touchstart', this.initFunc);
    }

    registerBGM = (name: string, file?: string) => {
        this.BGMs[name] = new BGM(`/assets/music/${file || name}.mp3`, 0.3);
    };

    init = () => {
        if (this.didInit) return;

        document.body.removeEventListener('keydown', this.initFunc);
        document.body.removeEventListener('click', this.initFunc);
        document.body.removeEventListener('touchstart', this.initFunc);
        this.didInit = true;

        for (const BGMIndex in this.BGMs) {
            this.BGMs[BGMIndex].init(this.activeSound === BGMIndex && LS.MUSIC === 'ON', () => {
                this.startedAt = Date.now();
            });
        }
    };

    play = (activeSound: string) => {
        if (this.activeSound !== activeSound && activeSound) this.stop();
        if (activeSound) this.activeSound = activeSound;
        if (LS.MUSIC === 'OFF' || !this.activeSound) return;
        if (this.pausedAt) {
            this.startedAt = Date.now() - this.pausedAt;
            this.BGMs[this.activeSound].play(0, this.pausedAt / 1000);
        } else {
            this.startedAt = Date.now();
            this.BGMs[this.activeSound].play(0);
        }
        this.pausedAt = 0;
    };

    pause = () => {
        if (this.activeSound) {
            this.pausedAt = Date.now() - this.startedAt;
        }
        this.stop();
    };

    stop = () => {
        if (this.activeSound) {
            this.BGMs[this.activeSound].stop();
        }
    };
}

export default new MusicClass();
