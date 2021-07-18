import React, { useState } from 'react';
import { Emotion } from '../types/InstructionTypes';

interface IUIContext {
    charactersInDialogue: string[];
    setCharactersInDialogue: React.Dispatch<React.SetStateAction<string[]>>;
    activeCharacter: string | undefined;
    setActiveCharacter: React.Dispatch<React.SetStateAction<string | undefined>>;
    activeCharacterEmotion: Emotion;
    setActiveCharacterEmotion: React.Dispatch<React.SetStateAction<Emotion>>;
    activeCharacterText: string | undefined;
    setActiveCharacterText: React.Dispatch<React.SetStateAction<string | undefined>>;
    stageStartQuote: string[] | undefined;
    setStageStartQuote: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}

export const UIContext = React.createContext<IUIContext>({
    charactersInDialogue: [],
    setCharactersInDialogue: () => {
        return;
    },
    activeCharacter: '',
    setActiveCharacter: () => {
        return;
    },
    activeCharacterEmotion: 'neutral',
    setActiveCharacterEmotion: () => {
        return;
    },
    activeCharacterText: '',
    setActiveCharacterText: () => {
        return;
    },
    stageStartQuote: [],
    setStageStartQuote: () => {
        return;
    },
});

export const useUIContext = () => {
    const [charactersInDialogue, setCharactersInDialogue] = useState<string[]>([]);
    const [activeCharacter, setActiveCharacter] = useState<string>();
    const [activeCharacterEmotion, setActiveCharacterEmotion] = useState<Emotion>('neutral');
    const [activeCharacterText, setActiveCharacterText] = useState<string>();
    const [stageStartQuote, setStageStartQuote] = useState<string[]>();

    return {
        charactersInDialogue,
        setCharactersInDialogue,
        activeCharacter,
        setActiveCharacter,
        activeCharacterEmotion,
        setActiveCharacterEmotion,
        activeCharacterText,
        setActiveCharacterText,
        stageStartQuote,
        setStageStartQuote,
    };
};
