interface StageWaitInstruction {
    type: 'wait';
    wait: number;
}

//UI

export type Emotion = 'angry' | 'dissapoint' | 'excited' | 'neutral' | 'shocked' | 'special' | 'tired';

interface StageUIInstruction {
    type: 'UI';
}

interface StageUIStageStartQuoteInstruction extends StageUIInstruction {
    action: 'stageStartQuote';
    text: string[];
}

interface StageUIDialogueInstruction extends StageUIInstruction {
    action: 'talk';
    actor: string;
    emotion: Emotion;
    text: string;
}

export type StageInstruction = StageWaitInstruction | StageUIStageStartQuoteInstruction | StageUIDialogueInstruction;

export type StageInstructionMap = {
    epochs: StageInstruction[][];
};
