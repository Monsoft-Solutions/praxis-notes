import { Function } from '@errors/types';
import { Success } from '@errors/utils';
import { ClientAbaData } from '@src/client-session/schemas/client-aba-data.schema';
import { ClientSessionReplacementProgramEntry } from '@src/client-session/schemas/client-session-replacement-program-entry.schema';

import { GenerateNotesPromptInput } from '../../schema';
/**
 * Creates a prompt for generating session notes based on session data
 * @param sessionData The session data to use for generating notes
 * @returns A formatted prompt string
 */
export const generateNotesPrompt = (({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clientData,
    sessionData,
}: GenerateNotesPromptInput) => {
    const prompt = `<system_context>
You are a credentialed Registered Behavior Technician (RBT) generating professional, insurance-compliant session notes for CPT code 97153 (one-on-one adaptive behavior treatment by protocol).
</system_context>

<writing_requirements>
- Use third-person perspective throughout (refer to "the client" and "the RBT")
- Write in objective, behavioral language focusing on observable behaviors
- Avoid subjective interpretations or emotional language
- Include specific, measurable outcomes and data points
- Do not mention arrival or departure unless clinically relevant
- Create a flowing narrative without section headers or bullet points
</writing_requirements>

<session_data>
<date>${sessionData.sessionDate instanceof Date ? sessionData.sessionDate.toLocaleDateString() : sessionData.sessionDate}</date>
<time_range>${sessionData.startTime} – ${sessionData.endTime}</time_range>
<location>${sessionData.location}</location>
<participants>${sessionData.presentParticipants.join(', ') || 'None'}</participants>
<environmental_factors>${sessionData.environmentalChanges.join(', ') || 'None noted'}</environmental_factors>
</session_data>

<abc_data>
${sessionData.abcEntries
    .map(
        (abc, i) => `<abc_entry number="${i + 1}">
<antecedent>${abc.antecedentName}</antecedent>
<behaviors>${abc.behaviorNames.join(', ')}</behaviors>
<interventions>${abc.interventionNames.join(', ')}</interventions>
<replacement_programs>${getAbcReplacementProgramData(abc.id, sessionData.replacementProgramEntries)}</replacement_programs>
</abc_entry>`,
    )
    .join('\n')}
</abc_data>

<standalone_replacement_programs>
${sessionData.replacementProgramEntries
    .filter((rep) => !rep.linkedAbcEntryId)
    .map((rep) => replacementProgramText(rep))
    .join('\n')}
</standalone_replacement_programs>

<reinforcement_data>
<reinforcers_used>${sessionData.reinforcerNames.join(', ')}</reinforcers_used>
<session_valuation>${sessionData.valuation}</session_valuation>
<general_observations>${sessionData.observations ?? 'None'}</general_observations>
</reinforcement_data>

<client_context>
${expandClientData(clientData)}
</client_context>

<narrative_structure>
Your note must follow this exact chronological flow:

1. SESSION INITIATION
   - Client's presentation and behavioral state at session start
   - Environmental setup and relevant contextual factors
   - Brief mention of session goals aligned with treatment plan

2. INTERVENTION IMPLEMENTATION
   - Describe each activity in chronological order
   - For each observed behavior:
     * Specify the exact topography (what it looked like)
     * Note frequency, duration, or intensity as applicable
     * Document which replacement program was implemented
     * Include prompting levels used (full physical, partial physical, model, verbal, gestural, independent)
     * Report client's response and performance data (e.g., "3 out of 5 trials correct")
   - Connect each intervention to specific treatment goals
   - Include objective metrics throughout

3. SESSION CONCLUSION
   - Summarize client's overall response to interventions
   - Document specific progress toward treatment goals with data
   - Include any parent/caregiver collaboration or communication
   - Note recommendations for next session based on today's performance
</narrative_structure>

<compliance_requirements>
CRITICAL: Your note MUST demonstrate:
1. Medical necessity through clear goal-intervention connections
2. Strict adherence to prescribed protocols (no modifications)
3. Objective measurement of behaviors and outcomes
4. Professional terminology consistent with ABA practice
5. Sufficient detail for insurance reimbursement
6. Clear documentation of progress toward authorized treatment goals
</compliance_requirements>

<formatting_instructions>
Generate a single, cohesive narrative paragraph or series of connected paragraphs. Do not use:
- Headers or subheadings
- Bullet points or numbered lists
- First-person language
- Informal language or abbreviations
- Subjective descriptions of mood or internal states
</formatting_instructions>

<output_instruction>
Generate ONLY the completed session note narrative. Do not include any introductory text, explanations, or closing remarks. Begin directly with the session narrative and end when the narrative is complete.
</output_instruction>`;

    return Success(prompt);
}) satisfies Function<GenerateNotesPromptInput, string>;

export const expandClientData = (clientData: ClientAbaData) => {
    // Create a map of behavior IDs to names for easy lookup
    const behaviorMap = new Map<string, string>();
    clientData.behaviors.forEach((behavior) => {
        behaviorMap.set(behavior.behaviorId, behavior.name);
    });

    const output = `<replacement_programs>
${clientData.replacementPrograms
    .map((program) => {
        const relatedBehaviors = program.behaviorIds
            .map((id) => behaviorMap.get(id))
            .filter(Boolean);

        return `<program>
<name>${program.name}</name>
${relatedBehaviors.length > 0 ? `<target_behaviors>${relatedBehaviors.join(', ')}</target_behaviors>` : ''}
</program>`;
    })
    .join('\n')}
</replacement_programs>

<available_interventions>
${clientData.interventions
    .map((intervention) => {
        const relatedBehaviors = intervention.behaviors
            .map((id) => behaviorMap.get(id))
            .filter(Boolean);

        return `<intervention>
<name>${intervention.name}</name>
${relatedBehaviors.length > 0 ? `<target_behaviors>${relatedBehaviors.join(', ')}</target_behaviors>` : ''}
</intervention>`;
    })
    .join('\n')}
</available_interventions>`;

    return output;
};

export const getAbcReplacementProgramData = (
    abdId: string | null,
    replacementPrograms: ClientSessionReplacementProgramEntry[],
) => {
    if (!abdId) return '';

    const replacementProgram = replacementPrograms
        .filter((program) => program.linkedAbcEntryId === abdId)
        .map((program) => replacementProgramText(program));

    // remove the found replacement program from the array
    replacementPrograms = replacementPrograms.filter(
        (program) => program.linkedAbcEntryId !== abdId,
    );

    return replacementProgram.join('\n');
};

export const replacementProgramText = (
    replacementProgram: ClientSessionReplacementProgramEntry,
) => {
    let output = `<replacement_program_entry>
<program_name>${replacementProgram.replacementProgram}</program_name>`;

    if (
        replacementProgram.teachingProcedure &&
        replacementProgram.teachingProcedure.length > 0
    ) {
        output += `
<teaching_procedure>${replacementProgram.teachingProcedure}</teaching_procedure>`;
    }

    if (
        replacementProgram.promptingProcedure &&
        replacementProgram.promptingProcedure.length > 0
    ) {
        output += `
<prompting_procedure>${replacementProgram.promptingProcedure}</prompting_procedure>`;
    }

    if (replacementProgram.promptTypes.length > 0) {
        output += `
<prompt_types>${replacementProgram.promptTypes.join(', ')}</prompt_types>`;
    }

    if (
        replacementProgram.clientResponse &&
        replacementProgram.clientResponse.length > 0
    ) {
        output += `
<client_response>${replacementProgram.clientResponse}</client_response>`;
    }

    if (replacementProgram.progress) {
        output += `
<progress_indicator>${replacementProgram.progress}</progress_indicator>`;
    }

    output += `
</replacement_program_entry>`;

    return output;
};
