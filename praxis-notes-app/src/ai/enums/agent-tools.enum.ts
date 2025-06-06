import { z } from 'zod';

export const availableToolsEnumSchema = z.enum([
    'getClientData',
    'listAvailableClients',
    'think',
    'createClient',
    'listSystemBehaviors',
    'listReinforcers',
    'listReplacementPrograms',
    'listInterventions',
    'createAntecedent',
    'createBehavior',
    'createIntervention',
    'createReplacementProgram',
]);
