import { TransformNoteType } from '@src/notes/schema';
import {
    getAbcReplacementProgramData,
    replacementProgramText,
} from './generate-notes-prompt.provider';
import { ClientSession } from '@src/client-session/schemas';

export const transformNotesPrompt = ({
    notes,
    transformationType,
    customInstructions,
    sessionData,
}: {
    notes: string;
    transformationType: TransformNoteType;
    customInstructions?: string;
    sessionData: ClientSession;
}): string => {
    // Core prompt components that can be reused
    const basePrompt = `You are a credentialed BCBA reviewing ABA session notes. The final notes should always be in third person and objective. It should be written as a story of the client session, in paragraphs.`;

    const outputInstructions = `Your output should contain only the transformed notes, without any additional text or explanations. Preserve the narrative flow (beginning→during→end) and objective documentation.`;

    const medicalNecessityReminder = `Ensure all documentation maintains insurance compliance and medical necessity standards.`;

    // The transformation directives - more modular and focused
    const transformationDirectives: Record<
        TransformNoteType,
        {
            directive: string;
            emphasis: string[]; // Key aspects to emphasize for this transformation
        }
    > = {
        improve: {
            directive: `Improve these session notes with enhanced behavioral terminology and proper documentation.`,
            emphasis: [
                'behavioralTerminology',
                'objectiveLanguage',
                'protocolDocumentation',
            ],
        },

        shortenIt: {
            directive: `Condense these session notes while preserving all medically necessary elements.`,
            emphasis: ['conciseness', 'preserveData', 'narrativeFlow'],
        },

        cleanUp: {
            directive: `Reorganize these session notes to improve structure and flow.`,
            emphasis: [
                'organization',
                'consistentTerminology',
                'narrativeFlow',
            ],
        },

        makeDescriptive: {
            directive: `Enhance these notes with more precise behavioral terminology and specific ABC observations.`,
            emphasis: [
                'behavioralTerminology',
                'abcDetails',
                'specificMetrics',
            ],
        },

        makeDetailed: {
            directive: `Expand these notes with detailed behavioral observations and protocol implementations.`,
            emphasis: [
                'detailedObservations',
                'protocolSpecifics',
                'promptLevels',
                'responseMetrics',
            ],
        },

        simplify: {
            directive: `Simplify these notes using clearer language while maintaining all necessary information.`,
            emphasis: ['simplifiedLanguage', 'preserveData', 'narrativeFlow'],
        },

        paraphrase: {
            directive: `Paraphrase these notes using alternative professional clinical terminology.`,
            emphasis: [
                'alternativeTerminology',
                'preserveData',
                'objectiveLanguage',
            ],
        },

        summarize: {
            directive: `Provide a concise yet complete summary of these session notes.`,
            emphasis: ['conciseness', 'keyHighlights', 'specificDataPoints'],
        },

        fixMistakes: {
            directive: `Correct any clinical terminology errors, documentation gaps, or inconsistencies.`,
            emphasis: [
                'terminologyCorrection',
                'completeDocumentation',
                'consistencyCheck',
            ],
        },

        soundFluent: {
            directive: `Revise these notes to flow more naturally while maintaining professional clinical language.`,
            emphasis: [
                'naturalFlow',
                'professionalLanguage',
                'narrativeStructure',
            ],
        },

        makeObjective: {
            directive: `Rewrite these notes using objective, data-focused language.`,
            emphasis: [
                'objectiveLanguage',
                'dataFocus',
                'measurableDescriptions',
            ],
        },

        rewriteGeneral: {
            directive: `Rewrite these notes for interdisciplinary team members who may not specialize in ABA.`,
            emphasis: [
                'accessibleTerminology',
                'preserveData',
                'narrativeFlow',
            ],
        },

        rewriteESL: {
            directive: `Rewrite these notes using simpler language for team members with limited English proficiency.`,
            emphasis: [
                'simplifiedLanguage',
                'essentialInformation',
                'clearStructure',
            ],
        },

        rewriteExpert: {
            directive: `Rewrite these notes for BCBA supervision or peer review using advanced terminology.`,
            emphasis: [
                'advancedTerminology',
                'preciseDataLanguage',
                'behavioralPrinciples',
            ],
        },

        createOutline: {
            directive: `Transform these narrative notes into a structured clinical outline.`,
            emphasis: [
                'structuredFormat',
                'categorizedInformation',
                'comprehensiveContent',
            ],
        },

        customInstructions: {
            directive: `Follow these custom instructions: ${customInstructions ?? 'No custom instructions provided'}`,
            emphasis: ['customDirective'],
        },

        regenerate: {
            directive: `Completely rewrite these notes while maintaining all medically necessary information and data.`,
            emphasis: ['freshPerspective', 'preserveData', 'narrativeFlow'],
        },
    };

    // Create emphasis guidelines based on the selected transformation
    const createEmphasisGuidelines = (emphasisPoints: string[]) => {
        const emphasisGuidelines: Record<string, string> = {
            behavioralTerminology: `Use precise behavioral terminology appropriate for ABA documentation.`,
            objectiveLanguage: `Maintain third-person objective language throughout the notes.`,
            protocolDocumentation: `Clearly document protocols and interventions used during the session.`,
            conciseness: `Be concise while preserving all essential information.`,
            preserveData: `Preserve all behavioral data and measurement information.`,
            narrativeFlow: `Maintain a clear beginning→during→end narrative structure.`,
            organization: `Organize information logically by session phases and interventions.`,
            consistentTerminology: `Use consistent terminology throughout the document.`,
            abcDetails: `Include relevant Antecedent-Behavior-Consequence details.`,
            specificMetrics: `Include specific metrics and data points about client responses.`,
            detailedObservations: `Provide detailed behavioral observations.`,
            protocolSpecifics: `Specify exact protocols implemented during the session.`,
            promptLevels: `Document prompt levels used during interventions.`,
            responseMetrics: `Include measurable metrics of client responses.`,
            simplifiedLanguage: `Use clear, straightforward language without jargon when possible.`,
            alternativeTerminology: `Use alternative but equivalent professional clinical terminology.`,
            keyHighlights: `Highlight key session events, behaviors, and progress points.`,
            specificDataPoints: `Include specific data points and measurements.`,
            terminologyCorrection: `Correct any clinical terminology errors or misuse.`,
            completeDocumentation: `Fill in any documentation gaps regarding behaviors or interventions.`,
            consistencyCheck: `Ensure consistency in reporting throughout the notes.`,
            naturalFlow: `Create a natural, readable flow while maintaining clinical accuracy.`,
            professionalLanguage: `Use professional clinical language appropriate for medical documentation.`,
            narrativeStructure: `Maintain clear beginning, middle, and end structure.`,
            dataFocus: `Focus on observable, measurable data rather than interpretations.`,
            measurableDescriptions: `Use measurable descriptions instead of subjective statements.`,
            accessibleTerminology: `Use terminology accessible to non-ABA professionals.`,
            essentialInformation: `Maintain all essential clinical information and data points.`,
            clearStructure: `Use a clear, easy-to-follow structure.`,
            advancedTerminology: `Incorporate advanced behavioral terminology for expert review.`,
            preciseDataLanguage: `Use precise language regarding data measurement and analysis.`,
            behavioralPrinciples: `Reference relevant behavioral principles where appropriate.`,
            structuredFormat: `Use a structured format with clear sections and headers.`,
            categorizedInformation: `Categorize information by clinical relevance and type.`,
            comprehensiveContent: `Include comprehensive content covering all session aspects.`,
            freshPerspective: `Provide a fresh perspective on the session while maintaining accuracy.`,
            customDirective: `Follow the custom directives exactly as specified.`,
        };

        return emphasisPoints
            .map((point) => emphasisGuidelines[point] || '')
            .filter(Boolean)
            .join('\n');
    };

    // Get details about the specific transformation
    const selectedTransformation = transformationDirectives[transformationType];

    // If this is a custom instruction, handle it differently
    if (transformationType === 'customInstructions' && customInstructions) {
        return `${basePrompt}
        
## Follow these instructions from the user: 
\`\`\`
${customInstructions}
\`\`\`

Return only the transformed notes without additional text or explanations.

## Here are the notes to transform:
\`\`\`
${notes}
\`\`\`

## Session Context:
${formatSessionContext(sessionData)}`;
    }

    // Build the full prompt with the appropriate transformation
    const emphasisGuidelines = createEmphasisGuidelines(
        selectedTransformation.emphasis,
    );

    return `${basePrompt}

## Transformation Task:
${selectedTransformation.directive}

## Guidelines for this transformation:
${emphasisGuidelines}
${medicalNecessityReminder}

${outputInstructions}

## Original Notes:
\`\`\`
${notes}
\`\`\`

## Session Context:
${formatSessionContext(sessionData)}`;
};

// Helper function to format session context in a more structured way
function formatSessionContext(sessionData: ClientSession): string {
    // clone once so that consumed entries don't re-appear on subsequent iterations
    const remainingPrograms = [...sessionData.replacementProgramEntries];
    const abcEntriesFormatted = sessionData.abcEntries
        .map((abc, i) => {
            const linkedPrograms = getAbcReplacementProgramData(
                abc.id,
                remainingPrograms,
            );

            return `### ABC Entry ${i + 1}
- **Antecedent/Activity:** ${abc.antecedentName}
- **Behavior(s):** ${abc.behaviorNames.join(', ')}
- **Intervention(s):** ${abc.interventionNames.join(', ')}
${linkedPrograms ? `- **Related Replacement Programs:** ${linkedPrograms}` : ''}`;
        })
        .join('\n\n');

    const standalonePrograms = sessionData.replacementProgramEntries
        .filter((rep) => !rep.linkedAbcEntryId)
        .map((rep) => replacementProgramText(rep))
        .join('\n');

    return `
### ABC Entries
${abcEntriesFormatted}

${standalonePrograms ? `### Standalone Replacement Programs\n${standalonePrograms}\n` : ''}

### Session Details
- **Reinforcers Used:** ${sessionData.reinforcerNames.join(', ')}
- **Overall Session Valuation:** ${sessionData.valuation}
- **General Observations:** ${sessionData.observations ?? 'None provided'}
`;
}
