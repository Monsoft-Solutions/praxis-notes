import { Function } from '@errors/types';
import { Success } from '@errors/utils';
import { ClientAbaData } from '@src/client-session/schemas/client-aba-data.schema';

import { GenerateNoteSchema } from '@src/notes/schema/generate-note.schema';
/**
 * Creates a prompt for generating session notes based on session data
 * @param sessionData The session data to use for generating notes
 * @returns A formatted prompt string
 */
export const generateNotesPrompt = ((
    generateNoteSchema: GenerateNoteSchema,
) => {
    const { sessionData, clientData } = generateNoteSchema;

    const prompt = `
You are a credentialed Registered Behavior Technician (RBT) generating an insurance-ready session note.

Write in third-person, objective behavioural language.  
Avoid subjective adjectives (“happy”, “upset”) unless operationally defined.

SESSION SNAPSHOT
RBT: ${sessionData.userInitials}
Client: ${sessionData.clientInitials}
Date: ${sessionData.sessionDate instanceof Date ? sessionData.sessionDate.toLocaleDateString() : sessionData.sessionDate}
Time: ${sessionData.startTime} – ${sessionData.endTime}
Location: ${sessionData.location}
Participants: ${sessionData.presentParticipants.join(', ') || 'None'}
Environmental changes: ${sessionData.environmentalChanges.join(', ') || 'None'}

${sessionData.abcEntries
    .map(
        (abc, i) => `
ABC #${i + 1}
• Antecedent/Activity: ${abc.antecedentName}
• Behaviour(s): ${abc.behaviorNames.join(', ')}
• Intervention(s): ${abc.interventionNames.join(', ')}`,
    )
    .join('\n')}

${sessionData.replacementProgramEntries
    .map(
        (rep, i) => `
Replacement Program #${i + 1}
• Program: ${rep.replacementProgram}
• Teaching: ${rep.teachingProcedure}
• Prompting: ${rep.promptingProcedure} (${rep.promptTypes.join(', ')})`,
    )
    .join('\n')}

Overall valuation: ${sessionData.valuation}
General observations: ${sessionData.observations ?? 'None'}

CLIENT CONTEXT  (for linking behaviours ↔ programs ↔ interventions)
${expandClientData(clientData)}

Please generate a professional narrative report that flows like a cohesive story. 


GLOBAL NOTE RULES
1. Structure the narrative **Before → During → After** for every activity/intervention.
2. When describing a behaviour, include its topography (e.g., “kicking”, “hand-flapping”). Always mention the name of the behaviour.
3. Seamlessly embed data; no bullet lists or headings in the output.
5. Mention client, guardian, and RBT by initials only.
6. Finish with environmental summary + next-session plan.
7. Output must be plain text – no markdown, lists, tables, bold, or italics.

Return **only** the narrative report, nothing else.

Analyze critically the output and make sure it is correct. If necessary, use the think tool to think about the output.
`;

    return Success(prompt);
}) satisfies Function<GenerateNoteSchema, string>;

const expandClientData = (clientData: ClientAbaData) => {
    // Create a map of behavior IDs to names for easy lookup
    const behaviorMap = new Map<string, string>();
    clientData.behaviors.forEach((behavior) => {
        behaviorMap.set(behavior.behaviorId, behavior.name);
    });

    const output = `
### Replacement Programs:
${clientData.replacementPrograms
    .map((program) => {
        const relatedBehaviors = program.behaviorIds
            .map((id) => behaviorMap.get(id))
            .filter(Boolean);

        return `- ${program.name}${relatedBehaviors.length > 0 ? ` \n #### For behaviors: \n ${relatedBehaviors.join(', ')})` : ''}`;
    })
    .join('\n')}

###     Interventions:
${clientData.interventions
    .map((intervention) => {
        const relatedBehaviors = intervention.behaviors
            .map((id) => behaviorMap.get(id))
            .filter(Boolean);

        return `- ${intervention.name}${relatedBehaviors.length > 0 ? ` \n #### For behaviors: \n ${relatedBehaviors.join(', ')})` : ''}`;
    })
    .join('\n')}
    `;

    return output;
};
