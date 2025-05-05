import { z } from 'zod';

import { clientGenderEnum } from '../enums';

/**
 * Basic client information schema
 */
export const clientFormBasicInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(255),

    lastName: z.string().min(1, 'Last name is required').max(255),

    gender: clientGenderEnum,

    notes: z.string().optional().or(z.literal('')),
});

export type ClientFormBasicInfo = z.infer<typeof clientFormBasicInfoSchema>;
