import { z } from 'zod';

// Schema for the antecedent in ABC entries
const antecedentSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other antecedent properties as needed
});

// Schema for behaviors in ABC entries
const behaviorSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other behavior properties as needed
});

// Schema for interventions in ABC entries
const interventionSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other intervention properties as needed
});

// Schema for ABC entries
const abcEntrySchema = z.object({
    id: z.string(),
    antecedent: antecedentSchema,
    behaviors: z.array(behaviorSchema),
    interventions: z.array(interventionSchema),
});

// Schema for replacement programs
const replacementProgramSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other replacement program properties as needed
});

// Schema for teaching procedures
const teachingProcedureSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other teaching procedure properties as needed
});

// Schema for prompt types
const promptTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other prompt type properties as needed
});

// Schema for prompting procedures
const promptingProcedureSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other prompting procedure properties as needed
});

// Schema for replacement program entries
const replacementProgramEntrySchema = z.object({
    id: z.string(),
    replacementProgram: replacementProgramSchema,
    teachingProcedure: teachingProcedureSchema.nullable(),
    promptTypes: z.array(promptTypeSchema),
    promptingProcedure: promptingProcedureSchema.nullable(),
    clientResponse: z.string().nullable(),
    progress: z.number(),
});

// Schema for client
const clientSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other client properties as needed
});

// Schema for participants
const participantSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other participant properties as needed
});

// Schema for environmental changes
const environmentalChangeSchema = z.object({
    id: z.string(),
    name: z.string(),
    // Add other environmental change properties as needed
});

// Main schema for the getClientSession query output
export const getClientSessionOutputSchema = z.object({
    id: z.string(),
    location: z.string(),
    sessionDate: z.string(), // or z.date() if using date objects
    startTime: z.string(),
    endTime: z.string(),
    observations: z.string().nullable(),
    valuation: z.string(),
    client: clientSchema,
    participants: z.array(participantSchema),
    environmentalChanges: z.array(environmentalChangeSchema),
    abcEntries: z.array(abcEntrySchema),
    replacementProgramEntries: z.array(replacementProgramEntrySchema),
    // Add other properties as needed
});

export type GetClientSessionOutput = z.infer<
    typeof getClientSessionOutputSchema
>;
