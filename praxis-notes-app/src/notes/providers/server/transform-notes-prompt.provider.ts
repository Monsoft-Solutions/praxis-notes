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
    const mainPrompt = `You are a credentialed BCBA reviewing ABA session notes. The final notes should always by in third person and objective. It should be written as an story of the session. Your output should contain only the notes, without any additional text or explanations.`;

    // Get the appropriate prompt from our service
    const prompts: Record<TransformNoteType, string> = {
        improve: `Improve the following ABA session notes while maintaining insurance compliance and medical necessity documentation. Enhance behavioral terminology, maintain third-person objective language, and ensure proper documentation of protocols, interventions, and client responses. Preserve the narrative flow (beginning→during→end). \n\n\`\`\`${notes}\`\`\``,

        shortenIt: `Condense these ABA session notes while preserving all medically necessary elements: client presentation, behavior descriptions, protocol implementation, data collection, and progress toward treatment goals. Maintain narrative structure and third-person objective language. \n\n\`\`\`${notes}\`\`\``,

        cleanUp: `Reorganize these ABA session notes while maintaining the narrative flow (beginning→during→end). Ensure consistent terminology, proper documentation of medical necessity, and clear connections between behaviors, interventions, and treatment goals. \n\n\`\`\`${notes}\`\`\``,

        makeDescriptive: `Enhance these ABA session notes with more precise behavioral terminology and specific observations. Add relevant ABC (Antecedent-Behavior-Consequence) details where appropriate while maintaining the narrative flow. Include specific metrics and data points about client responses. \n\n\`\`\`${notes}\`\`\``,

        makeDetailed: `Expand these ABA session notes with detailed behavioral observations, specific protocols implemented, prompt levels used, client response metrics, and measurable progress toward treatment goals. Maintain narrative structure and insurance documentation requirements. \n\n\`\`\`${notes}\`\`\``,

        simplify: `Simplify these ABA session notes using clearer language while maintaining all medically necessary information, objective data, and the narrative flow (beginning→during→end). Ensure all interventions remain linked to treatment goals. \n\n\`\`\`${notes}\`\`\``,

        paraphrase: `Paraphrase these ABA session notes using alternative professional clinical terminology while preserving all behavioral data, intervention descriptions, and progress measurements. Maintain third-person objective language and narrative flow. \n\n\`\`\`${notes}\`\`\``,

        summarize: `Provide a concise yet complete summary of these ABA session notes highlighting client presentation, key behaviors addressed, protocols implemented, and progress observed. Maintain the narrative flow and include specific data points. \n\n\`\`\`${notes}\`\`\``,

        fixMistakes: `Correct any clinical terminology errors, documentation gaps, subjective language, or inconsistencies in these ABA session notes. Ensure protocols are properly documented, medical necessity is established, and narrative flow is maintained. \n\n\`\`\`${notes}\`\`\``,

        soundFluent: `Revise these ABA session notes to flow more naturally while maintaining professional clinical language, objective documentation, and narrative structure (beginning→during→end). Ensure all interventions remain linked to treatment goals. \n\n\`\`\`${notes}\`\`\``,

        makeObjective: `Rewrite these ABA session notes using objective, data-focused language. Replace any subjective statements with behavioral observations and measurable descriptions. Maintain third-person perspective, narrative flow, and documentation of medical necessity. \n\n\`\`\`${notes}\`\`\``,

        rewriteGeneral: `Rewrite these ABA session notes for interdisciplinary team members who may not specialize in ABA. Maintain all medically necessary information and data while using more accessible terminology. Preserve the narrative flow (beginning→during→end) and objective documentation. \n\n\`\`\`${notes}\`\`\``,

        rewriteESL: `Rewrite these ABA session notes using simpler language for team members or caregivers with limited English proficiency, while maintaining all essential clinical information, data points, and narrative structure. Preserve connections between behaviors and treatment goals. \n\n\`\`\`${notes}\`\`\``,

        rewriteExpert: `Rewrite these ABA session notes for BCBA supervision or peer review, using advanced behavioral terminology, precise data measurement language, and references to relevant behavioral principles. Maintain narrative flow while enhancing documentation of medical necessity and protocol adherence. \n\n\`\`\`${notes}\`\`\``,

        createOutline: `Transform these narrative ABA session notes into a structured clinical outline while preserving all medically necessary information. Include sections for: Client Presentation, Session Goals, Behavioral Observations, Protocols Implemented, Client Responses with Data, Progress Toward Treatment Goals, and Recommendations. \n\n\`\`\`${notes}\`\`\``,

        customInstructions: `
        ## Follow this instructions from the user: 
        \`\`\`
        ${customInstructions}
        \`\`\`
        Return only the transformed notes without additional text or explanations
        ## Here are the notes to transform:
        \`\`\`
        ${notes}
        \`\`\`
        `,
    };

    return `${mainPrompt}\n\n${prompts[transformationType]}`;
};
