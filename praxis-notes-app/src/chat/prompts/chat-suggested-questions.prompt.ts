export const chatSuggestedQuestionsPrompt = (({
    userName,
    userLanguage,
}: {
    userName: string;
    userLanguage?: string;
    practiceType?: string;
}) => {
    const prompt = `Generate 4 engaging, specific questions or instructions about Applied Behavior Analysis (ABA) therapy 
    that a user might want to ask an AI assistant. 
    
    These should be diverse, covering different aspects of ABA such as techniques, implementation, data collection, 
    or specific challenges.

    Include at least 1 question related to working with the user's clients or patients in ABA therapy settings.
    The question should be related to a client or patient that the user works with.
    The questions should address common client scenarios like:
    - Addressing challenging behaviors
    - Creating effective reinforcement systems
    - Implementing skill acquisition programs
    - Tracking client progress
    - Parent/caregiver training
    - Client transitions between settings

    The questions/instructions should be clear, specific, and invite detailed responses. They should be appropriate for 
    someone interested in learning about or implementing ABA therapy.

    The questions/instructions should be in the user's preferred language.

    The questions/instructions should have a maximum of 20 words each.

    User's preferred language: ${userLanguage}
    User's name: ${userName}`;
    return prompt;
}) satisfies (params: { userName: string; userLanguage?: string }) => string;
