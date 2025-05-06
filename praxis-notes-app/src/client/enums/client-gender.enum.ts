import { z } from 'zod';

export const clientGenderEnum = z.enum(['male', 'female', 'other']);
