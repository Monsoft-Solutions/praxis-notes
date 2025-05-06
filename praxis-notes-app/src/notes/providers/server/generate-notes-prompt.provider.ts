import { Function } from '@errors/types';
import { Success } from '@errors/utils';
import { ClientAbaData } from '@src/client-session/schemas/client-aba-data.schema';

import { GenerateNotesInput } from '@src/notes/schema/generate-note.schema';
/**
 * Creates a prompt for generating session notes based on session data
 * @param sessionData The session data to use for generating notes
 * @returns A formatted prompt string
 */
export const generateNotesPrompt = (({
    clientData,
    sessionData,
}: GenerateNotesInput) => {
    const prompt = `
You are a credentialed Registered Behavior Technician (RBT) generating an insurance-ready session note for CPT code 97153 (one-on-one adaptive behavior treatment by protocol).

Write in third-person, objective behavioral language without subjective interpretations. Focus on observable behaviors and measurable outcomes.

SESSION INFORMATION
RBT: ${sessionData.userInitials}
Client: ${sessionData.clientInitials}
Date: ${sessionData.sessionDate instanceof Date ? sessionData.sessionDate.toLocaleDateString() : sessionData.sessionDate}
Time: ${sessionData.startTime} – ${sessionData.endTime}
Total Duration: [Calculate minutes/hours]
Units of Service: [Calculate 15-minute units]
Location: ${sessionData.location}
Participants: ${sessionData.presentParticipants.join(', ') || 'None'}
Environmental changes: ${sessionData.environmentalChanges.join(', ') || 'None'}

CLIENT PRESENTATION
[Include brief description of client's initial presentation/status at beginning of session]

SESSION ACTIVITIES
${sessionData.abcEntries
    .map(
        (abc, i) => `
ABC #${i + 1}
- Antecedent/Activity: ${abc.antecedentName}
- Behaviour(s): ${abc.behaviorNames.join(', ')}
- Intervention(s): ${abc.interventionNames.join(', ')}`,
    )
    .join('\n')}

REPLACEMENT PROGRAMS ADDRESSED
${sessionData.replacementProgramEntries
    .map(
        (rep, i) => `
Replacement Program #${i + 1}
- Program: ${rep.replacementProgram}
- Teaching: ${rep.teachingProcedure}
- Prompting: ${rep.promptingProcedure} (${rep.promptTypes.join(', ')})`,
    )
    .join('\n')}

Overall session valuation: ${sessionData.valuation}
General observations: ${sessionData.observations ?? 'None'}

CLIENT CONTEXT (for linking behaviours ↔ programs ↔ interventions)
${expandClientData(clientData)}

NARRATIVE STRUCTURE GUIDELINES
Generate a professional narrative that follows this structure:
1. BEGINNING OF SESSION (Client presentation, setting, initial assessment)
   - Describe client's presentation upon arrival
   - Outline session goals tied to treatment plan
   - Mention environmental factors

2. DURING SESSION (Implementation of programs)
   - Detail each activity chronologically
   - Include specific behavior topographies observed
   - Document protocols implemented verbatim from the treatment plan
   - For each behavior observed, note its connection to a replacement program
   - The replacement program should be linked to the behavior in the client context section. This means that the story should mention that the RBT implemented the replacement program for the behavior(s) observed.
   - Include data on client responses (frequency, duration, intensity)
   - Document prompting levels and client performance metrics

3. END OF SESSION (Progress summary and recommendations)
   - Summarize overall response to interventions
   - Document progress toward specific treatment goals with metrics
   - Include any parent/caregiver communication
   - Briefly outline plan for next session

CRITICAL DOCUMENTATION STANDARDS
1. Demonstrate protocol adherence without modifications (per CPT 97153 requirements)
2. Clearly document medical necessity by connecting each intervention to specific goals
3. Include objective measurements of client responses (trials, percentages, frequency)
4. Use professional terminology and avoid subjective language
5. Format as flowing narrative text without bullets, sections, or headers
6. Apply third-person perspective consistently (client, RBT)
7. Document any collaboration with BCBA or other professionals
8. Include specific metrics showing progress toward treatment plan goals

Return ONLY the completed narrative note with no additional text.

FINAL VERIFICATION CHECKLIST
- Does the note clearly demonstrate medical necessity?
- Does the note document adherence to established protocols?
- Does the note include specific data points/metrics?
- Does the note avoid subjective language?
- Does the note follow the narrative flow (before→during→after)?
- Does the note adequately link interventions to treatment goals?
`;

    return Success(prompt);
}) satisfies Function<GenerateNotesInput, string>;

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
