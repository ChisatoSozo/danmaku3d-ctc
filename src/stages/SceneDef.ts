import { StageInstructionMap } from '../engine/types/InstructionTypes';

export const SceneDef = () => {
    const map: StageInstructionMap = {
        epochs: [],
    };

    map.epochs[0] = [];
    map.epochs[0].push({
        type: 'UI',
        action: 'stageStartQuote',
        text: [
            'Stage 6',
            'When ending the dream',
            `Is there a Noah's ark here? Until the time when rain shall continue for 40 days and 40 nights over paradse, there was only little time left`,
        ],
    });

    return map;
};
