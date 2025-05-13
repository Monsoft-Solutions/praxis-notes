export const translateNotesPrompt = ({
    notes,
    baseLanguage,
    targetLanguage,
}: {
    notes: string;
    baseLanguage: string;
    targetLanguage: string;
}): string => {
    const prompt = `
    Translate the following ABA (Applied Behavior Analysis) therapy session notes from ${baseLanguage} to ${targetLanguage}. 
    
    IMPORTANT TRANSLATION GUIDELINES:
    - Maintain all technical ABA terminology and concepts with precise translations
    - Preserve all clinical observations, data points, and measurements exactly as written
    - Do not modify, add, or remove any clinical content or assessments
    - Keep all names, dates, times, and numerical data unchanged
    - Maintain the original document structure, formatting, and bullet points
    - Translate headers and sections consistently
    - If you encounter specialized ABA terms without clear Spanish equivalents, maintain the English term followed by a brief Spanish explanation in parentheses
    
    NOTES TO TRANSLATE:
    ${notes}
    
    Please provide only the translated text without additional comments.
    `;
    return prompt;
};
