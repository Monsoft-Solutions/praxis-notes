import { AiModelName } from '@src/ai/enums';
import { AiGenerationQualitySelector } from '@src/ai/schemas/ai-generation-quality-selector.schema';

export const getModel = (model: AiGenerationQualitySelector): AiModelName => {
    switch (model) {
        case 'Fast':
            return 'claude-3-haiku-20240307';
        case 'Smart':
            return 'claude-3-5-haiku-latest';
        case 'Genius':
            return 'claude-sonnet-4-20250514';
        case 'File':
            return 'gpt-4o-2024-05-13';
    }
};
