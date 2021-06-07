import localstorage from 'local-storage';
import { useMemo } from 'react';
import { DIFFICULTY, DifficultyName, DifficultyNumber, QualityName } from '../utils/Constants';

export interface Score {
    name: string;
    score: number;
}

interface ILS {
    ///STATS
    HIGHEST_SCORE: number;
    DIFFICULTY: DifficultyName;
    DIFFICULTY_NUMBER: DifficultyNumber;
    CONTINUES_USED: number;
    DEATHS: number;
    BOMBS_USED: number;
    FRAMES_DROPPED: number;

    //Settings
    QUALITY: QualityName;
    SFX: 'ON' | 'OFF';
    MUSIC: 'ON' | 'OFF';

    NEW_SCORE: number;
    HIGH_SCORES: Score[];
}

const defaultLS: () => ILS = () => ({
    ///STATS
    HIGHEST_SCORE: 10000,
    DIFFICULTY: 'Lunatic',
    DIFFICULTY_NUMBER: 4,
    CONTINUES_USED: 0,
    DEATHS: 0,
    BOMBS_USED: 0,
    FRAMES_DROPPED: 0,

    //SETTINGS
    QUALITY: 'Hi',
    SFX: 'OFF',
    MUSIC: 'ON',

    NEW_SCORE: 0,
    HIGH_SCORES: [
        {
            name: '--------',
            score: 10000,
        },
        {
            name: '--------',
            score: 9000,
        },
        {
            name: '--------',
            score: 8000,
        },
        {
            name: '--------',
            score: 7000,
        },
        {
            name: '--------',
            score: 6000,
        },
        {
            name: '--------',
            score: 5000,
        },
        {
            name: '--------',
            score: 4000,
        },
    ],
});

export const LS = defaultLS();

const loadLS = () => {
    const loadedLS = JSON.parse(localstorage('LS') as unknown as string);
    if (!loadedLS) return;
    Object.assign(LS, loadedLS);

    LS.DIFFICULTY_NUMBER = DIFFICULTY[LS.DIFFICULTY];
};

export const useLS = () => {
    useMemo(() => loadLS(), []);
    return LS;
};
