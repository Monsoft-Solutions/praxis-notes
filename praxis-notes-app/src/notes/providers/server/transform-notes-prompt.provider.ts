import { TransformNoteType } from '@src/notes/schema';

export const transformNotesPrompt = ({
    notes,
    transformationType,
    customInstructions,
}: {
    notes: string;
    transformationType: TransformNoteType;
    customInstructions?: string;
}): string => {
    // If custom instructions are provided and the transformation type is customInstructions
    if (transformationType === 'customInstructions' && customInstructions) {
        return `You are a credentialed BCBA reviewing ABA session notes. ${customInstructions}. Return only the transformed notes without additional text or explanations: \n\n${notes}`;
    }

    // Get the appropriate prompt from our service
    const prompts: Record<TransformNoteType, string> = {
        improve: `You are a credentialed BCBA reviewing ABA session notes. Improve the following ABA session notes while maintaining insurance compliance and medical necessity documentation. Enhance behavioral terminology, maintain third-person objective language, and ensure proper documentation of protocols, interventions, and client responses. Preserve the narrative flow (beginning→during→end). Return only the improved notes without additional text or explanations: \n\n${notes}`,

        shortenIt: `You are a credentialed BCBA reviewing ABA session notes. Condense these ABA session notes while preserving all medically necessary elements: client presentation, behavior descriptions, protocol implementation, data collection, and progress toward treatment goals. Maintain narrative structure and third-person objective language. Return only the shortened notes without additional text: \n\n${notes}`,

        cleanUp: `You are a credentialed BCBA reviewing ABA session notes. Reorganize these ABA session notes while maintaining the narrative flow (beginning→during→end). Ensure consistent terminology, proper documentation of medical necessity, and clear connections between behaviors, interventions, and treatment goals. Return only the cleaned-up notes without additional text: \n\n${notes}`,

        makeDescriptive: `You are a credentialed BCBA reviewing ABA session notes. Enhance these ABA session notes with more precise behavioral terminology and specific observations. Add relevant ABC (Antecedent-Behavior-Consequence) details where appropriate while maintaining the narrative flow. Include specific metrics and data points about client responses. Return only the enhanced notes without additional text: \n\n${notes}`,

        makeDetailed: `You are a credentialed BCBA reviewing ABA session notes. Expand these ABA session notes with detailed behavioral observations, specific protocols implemented, prompt levels used, client response metrics, and measurable progress toward treatment goals. Maintain narrative structure and insurance documentation requirements. Return only the detailed notes without additional text: \n\n${notes}`,

        simplify: `You are a credentialed BCBA reviewing ABA session notes. Simplify these ABA session notes using clearer language while maintaining all medically necessary information, objective data, and the narrative flow (beginning→during→end). Ensure all interventions remain linked to treatment goals. Return only the simplified notes without additional text: \n\n${notes}`,

        makeInformative: `You are a credentialed BCBA reviewing ABA session notes. Enhance these ABA session notes with additional relevant clinical context about intervention protocols, goal alignment, and behavioral function. Maintain the narrative structure and include specific metrics about client performance and progress. Return only the informative notes without additional text: \n\n${notes}`,

        paraphrase: `You are a credentialed BCBA reviewing ABA session notes. Paraphrase these ABA session notes using alternative professional clinical terminology while preserving all behavioral data, intervention descriptions, and progress measurements. Maintain third-person objective language and narrative flow. Return only the paraphrased notes without additional text: \n\n${notes}`,

        summarize: `You are a credentialed BCBA reviewing ABA session notes. Provide a concise yet complete summary of these ABA session notes highlighting client presentation, key behaviors addressed, protocols implemented, and progress observed. Maintain the narrative flow and include specific data points. Return only the summary without additional text: \n\n${notes}`,

        fixMistakes: `You are a credentialed BCBA reviewing ABA session notes. Correct any clinical terminology errors, documentation gaps, subjective language, or inconsistencies in these ABA session notes. Ensure protocols are properly documented, medical necessity is established, and narrative flow is maintained. Return only the corrected notes without additional text: \n\n${notes}`,

        soundFluent: `You are a credentialed BCBA reviewing ABA session notes. Revise these ABA session notes to flow more naturally while maintaining professional clinical language, objective documentation, and narrative structure (beginning→during→end). Ensure all interventions remain linked to treatment goals. Return only the revised notes without additional text: \n\n${notes}`,

        makeObjective: `You are a credentialed BCBA reviewing ABA session notes. Rewrite these ABA session notes using objective, data-focused language. Replace any subjective statements with behavioral observations and measurable descriptions. Maintain third-person perspective, narrative flow, and documentation of medical necessity. Return only the objective notes without additional text: \n\n${notes}`,

        soundProfessional: `You are a credentialed BCBA reviewing ABA session notes. Rewrite these ABA session notes using professional ABA terminology appropriate for insurance documentation. Ensure compliance with CPT code 97153 requirements, demonstrate protocol adherence, and document medical necessity. Maintain narrative structure and include specific metrics. Return only the professional notes without additional text: \n\n${notes}`,

        rewriteGeneral: `You are a credentialed BCBA reviewing ABA session notes. Rewrite these ABA session notes for interdisciplinary team members who may not specialize in ABA. Maintain all medically necessary information and data while using more accessible terminology. Preserve the narrative flow (beginning→during→end) and objective documentation. Return only the rewritten notes without additional text: \n\n${notes}`,

        rewriteESL: `You are a credentialed BCBA reviewing ABA session notes. Rewrite these ABA session notes using simpler language for team members or caregivers with limited English proficiency, while maintaining all essential clinical information, data points, and narrative structure. Preserve connections between behaviors and treatment goals. Return only the simplified notes without additional text: \n\n${notes}`,

        rewriteExpert: `You are a credentialed BCBA reviewing ABA session notes. Rewrite these ABA session notes for BCBA supervision or peer review, using advanced behavioral terminology, precise data measurement language, and references to relevant behavioral principles. Maintain narrative flow while enhancing documentation of medical necessity and protocol adherence. Return only the expert-level notes without additional text: \n\n${notes}`,

        createOutline: `You are a credentialed BCBA reviewing ABA session notes. Transform these narrative ABA session notes into a structured clinical outline while preserving all medically necessary information. Include sections for: Client Presentation, Session Goals, Behavioral Observations, Protocols Implemented, Client Responses with Data, Progress Toward Treatment Goals, and Recommendations. Return only the outline without additional text: \n\n${notes}`,

        moreIdeas: `You are a credentialed BCBA reviewing ABA session notes. Based on these ABA session notes, revise them to include additional evidence-based intervention strategies, data collection methods, or behavioral observations that would enhance documentation of medical necessity and treatment efficacy. Maintain narrative flow and third-person objective language. Return only the enhanced notes without additional text: \n\n${notes}`,

        customInstructions: `You are a credentialed BCBA reviewing ABA session notes. Follow these custom instructions: ${customInstructions ?? 'Improve the notes while maintaining professional standards'}. Return only the transformed notes without additional text or explanations: \n\n${notes}`,
    };

    return prompts[transformationType];
};
