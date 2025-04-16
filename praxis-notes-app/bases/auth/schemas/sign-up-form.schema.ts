import { z } from 'zod';

// Sign up form schema
export const signUpFormSchema = z.object({
    name: z.string(),

    email: z.string(),

    password: z.string(),
});

// Sign up form type
export type SignUpForm = z.infer<typeof signUpFormSchema>;
