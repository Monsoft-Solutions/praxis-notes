import { z } from 'zod';

// Log in credentials schema
export const logInCredentialsSchema = z.object({
    email: z.string().min(1).email(),
    password: z.string().min(1).min(6),
});

// Log in credentials type
export type LogInCredentials = z.infer<typeof logInCredentialsSchema>;
